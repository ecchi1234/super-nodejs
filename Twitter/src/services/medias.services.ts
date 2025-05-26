import { Request } from 'express'
import { getFiles, getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { uploadFileToS3 } from '~/utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { rimrafSync } from 'rimraf'

config()

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    // item = /home/duong/Downloads/1.mp4
    // -> mục tiêu cần lấy được 1 ra

    const slash = (await import('slash')).default
    const idName = getNameFromFullName(slash(item).split('/').pop() as string)
    await databaseService.videoStatus.insertOne(new VideoStatus({ name: idName, status: EncodingStatus.Pending }))
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const slash = (await import('slash')).default
      const idName = getNameFromFullName(slash(videoPath).split('/').pop() as string)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        { $set: { status: EncodingStatus.Processing }, $currentDate: { updated_at: true } }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
        const mime = await import('mime')

        await Promise.all(
          files.map((filePath) => {
            const fileName = 'videos-hls' + slash(filePath).replace(slash(path.resolve(UPLOAD_VIDEO_DIR)), '')
            return uploadFileToS3({
              filePath,
              fileName,
              contentType: mime.default.getType(filePath) as string
            })
          })
        )

        await Promise.all([
          fsPromise.unlink(videoPath),
          // có thể dùng với rimraf npm cũng được
          // rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName)),
          fsPromise.rm(path.resolve(UPLOAD_VIDEO_DIR, idName), { recursive: true, force: true })
        ])
        await databaseService.videoStatus.updateOne(
          { name: idName },
          { $set: { status: EncodingStatus.Success }, $currentDate: { updated_at: true } }
        )
        console.log(`Encoded video: ${videoPath}`)
      } catch (err) {
        await databaseService.videoStatus
          .updateOne({ name: idName }, { $set: { status: EncodingStatus.Failed }, $currentDate: { updated_at: true } })
          .catch((err) => {
            console.error('Error updating video status:', err)
          })
        console.error(`Error encoding video: ${videoPath}`, err)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newFullFileName}`)
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const mime = await import('mime')
        const s3Result = await uploadFileToS3({
          fileName: 'images/' + newFullFileName,
          filePath: newPath,
          contentType: mime.default.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newFullFileName}`
        //     : `http://localhost:${process.env.PORT}/static/image/${newFullFileName}`,
        //   type: MediaType.Image
        // }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const mime = await import('mime')

    const result = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          fileName: 'videos/' + file.newFilename,
          filePath: file.filepath,
          contentType: mime.default.getType(file.filepath) as string
        })

        await fsPromise.unlink(file.filepath)

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }

        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/video/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    )

    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )

    return result
  }

  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }
}

const mediasSservice = new MediasService()

export default mediasSservice

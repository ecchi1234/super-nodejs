import { Request } from 'express'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

config()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })

    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${file.newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
      })
    )

    return result
  }
}

const mediasSservice = new MediasService()

export default mediasSservice

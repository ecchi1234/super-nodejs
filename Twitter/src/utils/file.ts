import { Request } from 'express'
import fs from 'fs'
import { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import path from 'path'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(
        dir,
        { recursive: true } // mục đích là để tạo folder nested
      )
    }
  })
}

// tạo id trước cho file bằng nanoid rồi gán cho name

export const handleUploadImage = async (req: Request) => {
  // cần viết như thế này vì để fix lỗi es module sử dụng common js
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300kb
    maxTotalFileSize: 300 * 1024 * 4, // 300kb * 4 = 1.2mb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      // kiểm tra file có phải là ảnh hay không
      if (!valid) {
        // bị lỗi do @type là version 2 trong khi đang dùng formidable version 3
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return true
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files?.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

// Cách xử lý khi upload video và encode
// có 2 giai đoạn
// giai đoạn 1: upload video thành công thì resolve về cho người dùng
// giai đoạn 2: khai báo thêm một url end point để check xem cái video đó đã encode xong chưa

export const handleUploadVideo = async (req: Request) => {
  // cần viết như thế này vì để fix lỗi es module sử dụng common js
  const formidable = (await import('formidable')).default
  const { nanoid } = await import('nanoid')
  const idName = nanoid()
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, idName)
  fs.mkdirSync(folderPath)
  const form = formidable({
    uploadDir: folderPath,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024, // 50mb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && (Boolean(mimetype?.includes('mp4')) || Boolean(mimetype?.includes('quicktime')))
      // kiểm tra file có phải là video hay không
      if (!valid) {
        // bị lỗi do @type là version 2 trong khi đang dùng formidable version 3
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return true
    },
    filename: function () {
      return idName
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files?.video)) {
        return reject(new Error('File is empty'))
      }
      const videos = files.video as File[]

      videos.forEach((video) => {
        const extension = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + '.' + extension)
        video.newFilename = video.newFilename + '.' + extension
        video.filepath = video.filepath + '.' + extension
      })
      resolve(files.video as File[])
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const nameArr = fullName.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const getExtension = (fullName: string) => {
  const nameArr = fullName.split('.')
  return nameArr[nameArr.length - 1]
}

export const getFiles = (dir: string, files: string[] = []) => {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files)
    } else {
      // If it is a file, push the full path to the files array
      files.push(name)
    }
  }
  return files
}

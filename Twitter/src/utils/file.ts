import { Request } from 'express'
import fs from 'fs'
import path from 'path'

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads')
  if (fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(
      uploadFolderPath,
      { recursive: true } // mục đích là để tạo folder nested
    )
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  // cần viết như thế này vì để fix lỗi es module sử dụng common js
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300kb
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

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      // console.log('files', files)
      // console.log('fields', fields)
      if (err) {
        return reject(err)
      }
      if (!Boolean(files?.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files)
    })
  })
}

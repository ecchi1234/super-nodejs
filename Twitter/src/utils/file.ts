import { Request } from 'express'
import fs from 'fs'
import { File } from 'formidable'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(
      UPLOAD_TEMP_DIR,
      { recursive: true } // mục đích là để tạo folder nested
    )
  }
}

export const handleUploadImage = async (req: Request) => {
  // cần viết như thế này vì để fix lỗi es module sử dụng common js
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
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

export const getNameFromFullName = (fullName: string) => {
  const nameArr = fullName.split('.')
  nameArr.pop()
  return nameArr.join('')
}

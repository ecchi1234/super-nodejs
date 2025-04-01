import { Request, Response, NextFunction } from 'express'
import { handleUploadSingleImage } from '~/utils/file'
import path from 'path'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await handleUploadSingleImage(req)
  return res.json({
    result: data
  })
}

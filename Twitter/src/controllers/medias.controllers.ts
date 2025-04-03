import { Request, Response, NextFunction } from 'express'
import { handleUploadSingleImage } from '~/utils/file'
import path from 'path'
import mediasSservice from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasSservice.handleUploadSingleImage(req)
  return res.json({
    result: result
  })
}

import { Request, Response, NextFunction } from 'express'
import path from 'path'
import mediasSservice from '~/services/medias.services'
import { USERS_MESSAGES } from '~/constants/messages'
import { UPLOAD_DIR } from '~/constants/dir'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasSservice.uploadImage(req)
  return res.json({
    result: url,
    message: USERS_MESSAGES.UPLOAD_SUCCESS
  })
}

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

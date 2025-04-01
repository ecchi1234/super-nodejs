import { wrapRequestHandler } from './../utils/handlers'
import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediasRouter

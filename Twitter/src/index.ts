import express, { Request, Response, NextFunction } from 'express'
const app = express()
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'

config()

const port = process.env.PORT || 4000

databaseService.connect()

//tạo folder upload
initFolder()

app.use(express.json())

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
// serve static file cách 1: sử dụng express.static
// app.use('/static', express.static(UPLOAD_IMAGE_DIR))

// serve static file cách 2: sử dụng router
app.use('/static', staticRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

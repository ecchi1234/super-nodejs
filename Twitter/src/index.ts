import express, { Request, Response, NextFunction } from 'express'
const app = express()
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const port = 4000

databaseService.connect()

app.use(express.json())

app.use('/users', usersRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

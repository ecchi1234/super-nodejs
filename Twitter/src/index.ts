import express from 'express'
const app = express()
import usersRouter from '~/routes/users.routes'

const port = 3000

app.use(express.json())

app.use('/users', usersRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

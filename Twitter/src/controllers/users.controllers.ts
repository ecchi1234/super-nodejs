import { NextFunction, Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'nguyenngocc0800@gmail.com' && password === '123456') {
    return res.json({ message: 'Login success' })
  }
  return res.status(400).json({ error: 'Login failed' })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  return res.json({ message: 'Register success', data: result })
}

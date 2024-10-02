import { Router } from 'express'
import {
  emailVerifyTokenController,
  forgotPasswordController,
  loginController,
  logOutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * Description. Login a user
 * Path: /login
 * Method: POST
 * Body : { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
/**
 * Description. Register a new user
 * Path: /register
 * Method: POST
 * Body : { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
/**
 * Description. Logout a user
 * Path: /logout
 * Method: POST
 * Headers : { Authorization: Bearer <access_token> }
 * Body : {refresh_token: string}
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logOutController))

/**
 * Description. Verify email when user click on the link
 * Path: /verify-email
 * Method: POST
 * Body : {email-verify-token: string}
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyTokenController))

/**
 * Description. Refresh token
 * Path: /refresh-token
 * Method: POST
 * Headers : { Authorization: Bearer <access_token> }
 * Body : {refresh_token: string}
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description. Verify email when user click on the link
 * Path: /resend-verify-email
 * Method: POST
 * Headers : { Authorization: Bearer <access_token> }
 * Body : {}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description. Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body : {email: string}
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

export default usersRouter

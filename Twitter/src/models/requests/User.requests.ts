import { ParamsDictionary } from 'express-serve-static-core'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  cover_photo?: string
  username?: string
  avatar?: string
}

export interface FollowReqBody {
  followed_user_id: string
}
export interface LoginReqBody {
  email: string
  password: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface GetProfileRequestParams extends ParamsDictionary {
  username: string
}

export interface UnfollowRequestParams extends ParamsDictionary {
  user_id: string
}

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}
export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

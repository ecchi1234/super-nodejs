import { ParamsDictionary } from 'express-serve-static-core'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: chitest16@gmail.com
 *         password:
 *           type: string
 *           example: Chi@1234
 *
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refresh_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: MongoId
 *           description: ID duy nhất của người dùng
 *           example: '67ee5c34c762460f5c091c36'
 *         name:
 *           type: string
 *           description: Tên của người dùng
 *           example: 'Nguyễn Văn A'
 *         email:
 *           type: string
 *           format: email
 *           description: Địa chỉ email của người dùng
 *           example: 'nguyen.van.a@example.com'
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           description: Ngày sinh của người dùng (ISO 8601 format)
 *           example: '1995-10-26T00:00:00.000Z'
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           description: Thời gian tạo tài khoản
 *           example: '2024-01-15T10:30:00.123Z'
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           description: Thời gian cập nhật tài khoản
 *           example: '2025-06-25T15:11:46.000Z'
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         twitter_circle:
 *           type: array
 *           items:
 *             type: string
 *             format: MongoId
 *           description: Danh sách ID của các người dùng trong Twitter Circle
 *           example: ['67ee5c34c762460f5c091c36', '67ee5c34c762460f5c091c37']
 *         bio:
 *           type: string
 *           description: Tiểu sử người dùng
 *           example: 'Một người đam mê công nghệ và thích khám phá những điều mới mẻ.'
 *         location:
 *           type: string
 *           description: Vị trí của người dùng
 *           example: 'Hà Nội, Việt Nam'
 *         website:
 *           type: string
 *           format: uri
 *           description: Trang web cá nhân
 *           example: 'https://www.example.com/nguyenvana'
 *         username:
 *           type: string
 *           description: Tên người dùng duy nhất
 *           example: 'nguyenvana95'
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL ảnh đại diện
 *           example: 'https://example.com/avatars/nguyenvana.jpg'
 *         cover_photo:
 *           type: string
 *           format: uri
 *           description: URL ảnh bìa
 *           example: 'https://example.com/covers/nguyenvana_cover.png'
 *
 *     UserVerifyStatus:
 *       type: number
 *       enum: [Unverified, Verified, Banned]
 *       example: 1
 */

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

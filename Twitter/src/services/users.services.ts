import databaseService from '~/services/database.services'
import User from '~/models/schemas/User.schema'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USERS_MESSAGES } from '~/constants/messages'

config()
class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        algorithm: 'HS256',
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        algorithm: 'HS256',
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        algorithm: 'HS256',
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        algorithm: 'HS256',
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  private async signAccessAndRefreshTokens(user_id: string) {
    return await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()

    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(user_id.toString())
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    console.log('email_verify_token', email_verify_token)
    return { access_token, refresh_token }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })

    return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
  }

  async refreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    // chưa học đến bài có user verify nên tạm thời ntn đã

    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: new_refresh_token })
    )

    return { access_token, new_refresh_token }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshTokens(user_id),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        { $set: { email_verify_token: '', updated_at: '$$NOW', verify: UserVerifyStatus.Verified } }
      ])
    ])
    const [access_token, refresh_token] = token
    return { access_token, refresh_token }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { email_verify_token, updated_at: '$$NOW' } }
    ])
    return { message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS }
  }

  async forgotPassword(user_id: string) {
    // tạo forgot password token
    const forgot_password_token = await this.signForgotPasswordToken(user_id)

    // lưu forgot password token vào db
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { forgot_password_token, updated_at: '$$NOW' } }
    ])

    // gủi email kèm đường link đến email người dùng: https://domain.com/forgot-password?token=forgot_password_token
    console.log('forgot_password_token', forgot_password_token)

    return { message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { forgot_password_token: '', password: hashPassword(password) },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 }
      }
    )
    return user
  }
}

const usersService = new UsersService()
export default usersService

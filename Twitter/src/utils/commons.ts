import { Request } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { capitalize } from 'lodash'
import { JsonWebTokenError } from 'jsonwebtoken'
import { envConfig } from '~/constants/config'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublickey: envConfig.jwtSecretAccessToken as string
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }

    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: capitalize((error as JsonWebTokenError).message)
    })
  }
}

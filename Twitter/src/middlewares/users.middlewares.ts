import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'
import { checkSchema, ParamSchema } from 'express-validator'
import usersService from '~/services/users.services'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enums'
import { REGEX_USERNAME } from '~/constants/regex'

const passwordSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,

      minNumbers: 1,
      minSymbols: 1
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED },
  isString: { errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING },
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}

const imageSchema: ParamSchema = {
  isString: { errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }

      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublickey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const user = await databaseService.users.findOne({
          _id: new ObjectId(decoded_forgot_password_token.user_id)
        })

        if (user === null) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: USERS_MESSAGES.USER_NOT_FOUND
          })
        }

        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: capitalize(error.message)
          })
        }
        throw error
      }
      return true
    }
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: USERS_MESSAGES.INVALID_USER_ID
        })
      }

      const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
      if (followed_user === null) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: USERS_MESSAGES.USER_NOT_FOUND
        })
      }
    }
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        isEmail: { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
        normalizeEmail: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG,
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,

            minNumbers: 1,
            minSymbols: 1
          }
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        trim: true,
        isEmail: { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
        normalizeEmail: {
          options: {
            gmail_remove_dots: false,
            gmail_remove_subaddress: false
          }
        },
        custom: {
          options: async (value) => {
            const result = await usersService.checkEmailExist(value)
            if (result) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublickey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: capitalize((error as JsonWebTokenError).message)
              })
            }

            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublickey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              ;(req as Request).decoded_refresh_token = decoded_refresh_token

              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublickey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                })
              }
              throw error
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        isEmail: { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
        normalizeEmail: {
          options: {
            gmail_remove_dots: false,
            gmail_remove_subaddress: false
          }
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (user === null) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload

  // next chạy được với cả async function và sync function
  // còn nếu dùng throw error thì chỉ chạy được với sync function
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: USERS_MESSAGES.USER_NOT_VERIFIED
      })
    )
  }

  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: { ...nameSchema, optional: true, notEmpty: undefined },
      date_of_birth: { ...dateOfBirthSchema, optional: true },
      bio: {
        isString: { errorMessage: USERS_MESSAGES.BIO_MUST_BE_A_STRING },
        trim: true,
        optional: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_FROM_1_TO_200
        }
      },
      location: {
        isString: { errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_A_STRING },
        trim: true,
        optional: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_FROM_1_TO_200
        }
      },
      website: {
        isString: { errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_A_STRING },
        trim: true,
        optional: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200
        }
      },
      user_name: {
        isString: { errorMessage: USERS_MESSAGES.USER_NAME_MUST_BE_A_STRING },
        trim: true,
        optional: true,
        custom: {
          options: async (value, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new Error(USERS_MESSAGES.USERNAME_INVALID)
            }

            const user = await databaseService.users.findOne({ username: value })

            if (user !== null) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['body']
  )
)

export const unfollowValidator = validate(checkSchema({ user_id: userIdSchema }, ['params']))

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

            if (user === null) {
              throw new ErrorWithStatus({ status: HTTP_STATUS.NOT_FOUND, message: USERS_MESSAGES.USER_NOT_FOUND })
            }

            const { password } = user

            const isMatch = hashPassword(value) === password

            if (!isMatch) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH
              })
            }
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    return next()
  }
}

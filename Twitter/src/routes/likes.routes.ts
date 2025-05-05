import { Router } from 'express'
import {
  likeTweetController,
  unlikeTweetByLikeIdController,
  unlikeTweetController
} from '~/controllers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

/**
 * Description. Like Tweet
 * Path: /
 * Method: POST
 * Body : {tweet_id: string}
 * Header: { Authorization: Bearer <access_token> }
 */

likesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

/**
 * Description. Unlike Tweet
 * Path: /:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */

likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetController)
)

/**
 * Description. Unlike Tweet By like ID
 * Path: /:like_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */

likesRouter.delete(
  '/:like_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetByLikeIdController)
)

export default likesRouter

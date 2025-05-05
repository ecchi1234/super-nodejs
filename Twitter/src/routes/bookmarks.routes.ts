import { Router } from 'express'
import {
  bookmarkTweetController,
  unbookmarkTweetByBookmarkIdController,
  unbookmarkTweetController
} from '~/controllers/bookmarks.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * Description. Bookmark Tweet
 * Path: /
 * Method: POST
 * Body : {tweet_id: string}
 * Header: { Authorization: Bearer <access_token> }
 */

bookmarksRouter.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarkTweetController))

/**
 * Description. Unbookmark Tweet
 * Path: /:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */

bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

/**
 * Description. Unbookmark Tweet By Bookmark ID
 * Path: /:bookmark_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */

bookmarksRouter.delete(
  '/:bookmark_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unbookmarkTweetByBookmarkIdController)
)

export default bookmarksRouter

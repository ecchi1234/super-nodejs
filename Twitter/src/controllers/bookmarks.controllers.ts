import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'

import { TokenPayload } from '~/models/requests/User.requests'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.requests'
import bookmarkService from '~/services/bookmarks.services'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id as string)
  return res.json({
    message: BOOKMARKS_MESSAGES.BOOKMARK_SUCCESS,
    result
  })
}

export const unbookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await bookmarkService.unbookmarkTweet(user_id, req.params.tweet_id as string)
  return res.json({
    message: BOOKMARKS_MESSAGES.UNBOOKMARK_SUCCESS
  })
}

export const unbookmarkTweetByBookmarkIdController = async (req: Request, res: Response) => {
  await bookmarkService.unbookmarkTweetByBookmarkId(req.params.bookmark_id as string)
  return res.json({
    message: BOOKMARKS_MESSAGES.UNBOOKMARK_SUCCESS
  })
}

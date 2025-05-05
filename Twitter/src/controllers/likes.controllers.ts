import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'

import { TokenPayload } from '~/models/requests/User.requests'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.requests'
import likeService from '~/services/likes.services'
import { BOOKMARKS_MESSAGES, LIKES_MESSAGES } from '~/constants/messages'

export const likeTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likeService.likeTweet(user_id, req.body.tweet_id as string)
  return res.json({
    message: LIKES_MESSAGES.LIKE_SUCCESSFULLY,
    result
  })
}

export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await likeService.unlikeTweet(user_id, req.params.tweet_id as string)
  return res.json({
    message: LIKES_MESSAGES.UNLIKE_SUCCESSFULLY
  })
}

export const unlikeTweetByLikeIdController = async (req: Request, res: Response) => {
  await likeService.unlikeTweetByLikeId(req.params.like_id as string)
  return res.json({
    message: LIKES_MESSAGES.UNLIKE_SUCCESSFULLY
  })
}

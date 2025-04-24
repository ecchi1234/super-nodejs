import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import tweetService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    message: 'Create tweet successfully',
    result
  })
}

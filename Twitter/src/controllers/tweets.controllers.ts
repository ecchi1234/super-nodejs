import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import tweetService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'
import { TWEETS_MESSAGES } from '~/constants/messages'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    message: TWEETS_MESSAGES.CREATE_SUCCESS,
    result
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: req.tweet
  })
}

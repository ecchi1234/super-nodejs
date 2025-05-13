import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { PaginationQuery, TweetParam, TweetQuery, TweetRequestBody } from '~/models/requests/Tweet.requests'
import tweetService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetType } from '~/constants/enums'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    message: TWEETS_MESSAGES.CREATE_SUCCESS,
    result
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  const result = await tweetService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    user_views: result.user_views,
    guest_views: result.guest_views,
    updated_at: result.updated_at
  }
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: tweet
  })
}

export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id
  const { total, tweets } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESS,
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}

export const getNewsFeedController = async (
  req: Request<ParamsDictionary, any, any, PaginationQuery>,
  res: Response
) => {
  const user_id = req.decoded_authorization?.user_id as string
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const result = await tweetService.getNewsFeed({ user_id, limit, page })

  return res.json({
    message: 'oke',
    result: { tweets: result.tweets, limit, page, total_page: Math.ceil(result.total / limit) }
  })
  // const result = await tweetService.getNewsFeed(req.decoded_authorization?.user_id, req.query)
}

import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string // chỉ null khi là tweet gốc
  hashtags: string[] // id của hashtag
  mentions: string[] // id của mention
  medias: Media[]
}

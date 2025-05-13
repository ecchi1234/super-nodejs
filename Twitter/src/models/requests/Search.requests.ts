import { PaginationQuery } from './Tweet.requests'

export interface SearchQuery extends PaginationQuery {
  content: string
}

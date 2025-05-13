import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const result = await searchService.search({
    limit,
    page,
    content: req.query.content
  })
  res.json({
    message: 'Search success',
    result
  })
}

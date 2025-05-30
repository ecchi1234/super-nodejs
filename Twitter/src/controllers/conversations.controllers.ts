import { Request, Response } from 'express'
import conversationService from '~/services/conversations.services'

export const getConversationsController = async (req: Request, res: Response) => {
  const { receiver_id } = req.params
  const limit = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const sender_id = req.decoded_authorization?.user_id as string
  const result = await conversationService.getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  })
  return res.json({
    message: 'Get conversations successfully',
    result: {
      conversations: result.conversations,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}

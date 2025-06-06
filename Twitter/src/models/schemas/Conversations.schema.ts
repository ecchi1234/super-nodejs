import { ObjectId } from 'mongodb'

interface ConversationType {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  created_at?: Date
  updated_at?: Date
  content: string
}

export default class Conversation {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  created_at: Date
  updated_at: Date
  content: string

  constructor({ _id, sender_id, receiver_id, created_at, updated_at, content }: ConversationType) {
    const date = new Date()
    this._id = _id || new ObjectId()
    this.sender_id = sender_id
    this.receiver_id = receiver_id
    this.content = content || ''
    this.created_at = created_at ? created_at : date
    this.updated_at = updated_at ? updated_at : date
  }
}

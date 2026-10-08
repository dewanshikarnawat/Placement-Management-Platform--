import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema({
  id: { type: String, required: true, unique: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverRole: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
  read: { type: Boolean, required: true, default: false },
  internshipId: { type: String },
  internshipTitle: { type: String }
}, { timestamps: true });

export const MessageModel = mongoose.model('Message', MessageSchema);
export default MessageModel;

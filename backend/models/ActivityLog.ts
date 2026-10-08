import mongoose, { Schema } from 'mongoose';

const ActivityLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
  role: { type: String, required: true },
  category: { type: String, required: true }
}, { timestamps: true });

export const ActivityLogModel = mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLogModel;

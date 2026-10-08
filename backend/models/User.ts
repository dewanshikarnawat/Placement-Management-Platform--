import mongoose, { Schema } from 'mongoose';

const UserProfileSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Admin', 'Company', 'Student', 'Faculty'] },
  companyName: { type: String },
  recruiterVerificationStatus: {
    type: String,
    enum: ['Pending', 'Genuine', 'Not Genuine'],
    default: 'Pending'
  },
  recruiterVerificationReason: { type: String, default: '' },
  recruiterVerifiedBy: { type: String, default: '' },
  studentProfileVerificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Unverified'],
    default: 'Pending'
  },
  studentProfileVerificationRemark: { type: String, default: '' },
  studentProfileVerifiedBy: { type: String, default: '' },
  avatarUrl: { type: String },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  resumeUrl: { type: String, default: '' },
  resumeName: { type: String, default: '' },
  college: { type: String, default: '' },
  graduationYear: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  xUrl: { type: String, default: '' },
  grades: {
    type: [{
      semester: { type: String, required: true },
      gpa: { type: String, required: true }
    }],
    default: []
  },
  certificates: {
    type: [{
      name: { type: String, required: true },
      issuer: { type: String, required: true },
      date: { type: String, required: true },
      credentialUrl: { type: String, default: '' }
    }],
    default: []
  }
}, { timestamps: true });

export const UserProfileModel = mongoose.model('UserProfile', UserProfileSchema);
export default UserProfileModel;


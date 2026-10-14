import mongoose from 'mongoose';

const familyConnectionSchema = new mongoose.Schema({
  seniorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relation: {
    type: String,
    default: 'Family Member'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'declined'],
    default: 'active'
  }
}, {
  timestamps: true
});

familyConnectionSchema.index({ seniorUserId: 1, familyUserId: 1 }, { unique: true });

export const FamilyConnection = mongoose.model('FamilyConnection', familyConnectionSchema);

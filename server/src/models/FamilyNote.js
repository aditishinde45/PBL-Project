import mongoose from 'mongoose';

const familyNoteSchema = new mongoose.Schema({
  seniorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRelation: {
    type: String,
    default: 'Family Member'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  emoji: {
    type: String,
    default: '❤️'
  },
  readBySenior: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const FamilyNote = mongoose.model('FamilyNote', familyNoteSchema);

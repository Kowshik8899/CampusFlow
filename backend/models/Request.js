const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  images: [{ type: String }], // URLs or base64
  status: { type: String, enum: ['SUBMITTED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED'], default: 'SUBMITTED' },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  resolutionNotes: { type: String },
  assignedAt: { type: Date },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  history: [{
    status: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);

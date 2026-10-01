const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  keywords: [{ type: String }], // for Smart Request Assistant
  defaultPriority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);

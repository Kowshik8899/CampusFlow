const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'STAFF', 'ADMIN'], default: 'STUDENT' },
  // Extended fields for Staff/Admin
  phone: { type: String },
  designation: { type: String },
  specialization: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  profileImage: { type: String },
  staffId: { type: String },
  adminId: { type: String },
  // Staff specific
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  // Student specific
  rollNumber: { type: String },
  roomNumber: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Department = require('../models/Department');
const Category = require('../models/Category');
const Request = require('../models/Request');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

// @desc    Create staff user
// @route   POST /api/admin/staff
router.post('/staff', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, password: hashedPassword, role: 'STAFF', department
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'ADMIN' } }).populate('department', 'name').select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get analytics
// @route   GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const byStatus = await Request.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const avgRating = await Request.aggregate([{ $match: { rating: { $exists: true } } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]);
    
    // department workload
    const workload = await Request.aggregate([
      { $group: { _id: { dept: '$department', status: '$status' }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        byStatus,
        avgRating: avgRating[0] ? avgRating[0].avg : 0,
        workload
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create department
// @route   POST /api/admin/departments
router.post('/departments', async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create category
// @route   POST /api/admin/categories
router.post('/categories', async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

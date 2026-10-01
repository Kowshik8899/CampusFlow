const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Category = require('../models/Category');

// @desc    Get all departments
// @route   GET /api/data/departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all categories
// @route   GET /api/data/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('department', 'name');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

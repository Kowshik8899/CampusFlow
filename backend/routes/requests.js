const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Helper to generate Request ID
const generateRequestId = async () => {
  const count = await Request.countDocuments();
  return `REQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Submit a new request
// @route   POST /api/requests
// @access  Private (STUDENT)
router.post('/', protect, authorize('STUDENT'), async (req, res) => {
  try {
    const { category, location, description, priority, images } = req.body;
    
    // Auto-suggest logic if category is not provided explicitly
    let assignedCategory = category;
    let categoryDoc = null;
    if (assignedCategory) {
      categoryDoc = await Category.findById(assignedCategory);
    }
    
    // Create request
    const request = await Request.create({
      requestId: await generateRequestId(),
      student: req.user.id,
      category: categoryDoc ? categoryDoc._id : undefined,
      department: categoryDoc ? categoryDoc.department : undefined,
      location,
      description,
      priority: priority || (categoryDoc ? categoryDoc.defaultPriority : 'LOW'),
      images,
      status: 'SUBMITTED',
      history: [{ status: 'SUBMITTED', updatedBy: req.user.id }]
    });

    // Notify all admins
    const Admin = require('../models/User'); // avoid circular or just query
    const admins = await Admin.find({ role: 'ADMIN' });
    const notifications = admins.map(admin => ({
      user: admin._id,
      title: 'New Request Submitted',
      message: `Request ${request.requestId} has been submitted.`,
      request: request._id
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all requests for a user (Student: own, Staff: assigned, Admin: all)
// @route   GET /api/requests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'STUDENT') {
      query.student = req.user.id;
    } else if (req.user.role === 'STAFF') {
      query.assignedStaff = req.user.id;
    }

    const requests = await Request.find(query)
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('student', 'name email roomNumber rollNumber')
      .populate('assignedStaff', 'name')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('student', 'name email roomNumber rollNumber')
      .populate('assignedStaff', 'name')
      .populate('comments.user', 'name role');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private (ADMIN, STAFF, STUDENT for rating)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, rating, feedback, assignedStaff, department } = req.body;
    let request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Role-based logic
    if (req.user.role === 'ADMIN' && status === 'ASSIGNED') {
      request.status = 'ASSIGNED';
      request.assignedStaff = assignedStaff;
      if (department) request.department = department;
      
      // Notify student & staff
      await Notification.insertMany([
        { user: request.student, title: 'Request Assigned', message: `Your request ${request.requestId} has been assigned.`, request: request._id },
        { user: assignedStaff, title: 'New Request Assigned', message: `You have been assigned request ${request.requestId}.`, request: request._id }
      ]);
    } else if (req.user.role === 'STAFF' && ['IN_PROGRESS', 'RESOLVED'].includes(status)) {
      if (request.assignedStaff.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      request.status = status;

      // Notify student
      await Notification.create({
        user: request.student,
        title: `Request ${status.replace('_', ' ')}`,
        message: `Your request ${request.requestId} is now ${status.replace('_', ' ')}.`,
        request: request._id
      });
    } else if (status === 'CLOSED') {
      // Student or Admin can close
      request.status = 'CLOSED';
      if (rating) request.rating = rating;
      if (feedback) request.feedback = feedback;

      // Notify staff and admins
      const Admin = require('../models/User');
      const admins = await Admin.find({ role: 'ADMIN' });
      const notifications = admins.map(a => ({
        user: a._id, title: 'Request Closed', message: `Request ${request.requestId} has been closed.`, request: request._id
      }));
      if (request.assignedStaff) {
        notifications.push({ user: request.assignedStaff, title: 'Request Closed', message: `Request ${request.requestId} has been closed.`, request: request._id });
      }
      await Notification.insertMany(notifications);
    }

    request.history.push({ status: request.status, updatedBy: req.user.id });
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add comment
// @route   POST /api/requests/:id/comments
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    let request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.comments.push({ user: req.user.id, text });
    await request.save();

    // Notify other parties
    const notifyUsers = new Set();
    if (req.user.id !== request.student.toString()) notifyUsers.add(request.student.toString());
    if (request.assignedStaff && req.user.id !== request.assignedStaff.toString()) notifyUsers.add(request.assignedStaff.toString());
    
    // Can also notify admins if needed. For now just student & assigned staff.
    const notifications = Array.from(notifyUsers).map(u => ({
      user: u, title: 'New Comment', message: `New comment on request ${request.requestId}`, request: request._id
    }));
    if (notifications.length > 0) await Notification.insertMany(notifications);

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Smart Assistant - Analyze Description
// @route   POST /api/requests/assistant
// @access  Private
router.post('/assistant', protect, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ success: false, message: 'Description required' });

    const categories = await Category.find().populate('department');
    let bestMatch = null;
    let maxMatches = 0;

    const descLower = description.toLowerCase();

    categories.forEach(cat => {
      let matches = 0;
      cat.keywords.forEach(kw => {
        if (descLower.includes(kw.toLowerCase())) matches++;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = cat;
      }
    });

    if (bestMatch) {
      res.status(200).json({
        success: true,
        suggestion: {
          categoryId: bestMatch._id,
          categoryName: bestMatch.name,
          departmentName: bestMatch.department.name,
          priority: bestMatch.defaultPriority
        }
      });
    } else {
      res.status(200).json({ success: true, suggestion: null });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Category = require('./models/Category');
const Request = require('./models/Request');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusflow');

const importData = async () => {
  try {
    await User.deleteMany();
    await Department.deleteMany();
    await Category.deleteMany();
    await Request.deleteMany();

    // Create Departments
    const deptMaintenance = await Department.create({ name: 'Maintenance & Civil', description: 'Plumbing, electrical, and infrastructure' });
    const deptIT = await Department.create({ name: 'IT Support', description: 'Network, hardware, and software issues' });
    const deptHostel = await Department.create({ name: 'Hostel Administration', description: 'Hostel allocations, cleaning, and issues' });
    const deptSecurity = await Department.create({ name: 'Security & Transport', description: 'Campus security, parking, and transport' });
    const deptMedical = await Department.create({ name: 'Medical Center', description: 'First aid and medical emergencies' });
    const deptAdmin = await Department.create({ name: 'General Administration', description: 'Canteen, library, and sports facilities' });

    // Create Categories
    const categories = [
      { name: 'Electrical', department: deptMaintenance._id, keywords: ['light', 'fan', 'switch', 'socket', 'power', 'bulb', 'wire'], defaultPriority: 'HIGH' },
      { name: 'Plumbing', department: deptMaintenance._id, keywords: ['leak', 'pipe', 'water', 'tap', 'flush', 'sink', 'drain'], defaultPriority: 'HIGH' },
      { name: 'Civil/Maintenance', department: deptMaintenance._id, keywords: ['wall', 'paint', 'door', 'window', 'glass', 'broken', 'roof'], defaultPriority: 'MEDIUM' },
      { name: 'Furniture', department: deptMaintenance._id, keywords: ['chair', 'table', 'desk', 'bed', 'cupboard', 'wood'], defaultPriority: 'LOW' },
      { name: 'AC/Ventilation', department: deptMaintenance._id, keywords: ['ac', 'air conditioner', 'cooling', 'vent', 'hot'], defaultPriority: 'MEDIUM' },
      { name: 'Water Supply', department: deptMaintenance._id, keywords: ['drinking water', 'cooler', 'dispenser', 'no water'], defaultPriority: 'HIGH' },
      
      { name: 'Internet/Wi-Fi', department: deptIT._id, keywords: ['wifi', 'internet', 'slow', 'disconnect', 'network', 'router'], defaultPriority: 'HIGH' },
      { name: 'Computer/Lab', department: deptIT._id, keywords: ['pc', 'computer', 'lab', 'monitor', 'keyboard', 'mouse', 'software'], defaultPriority: 'MEDIUM' },
      { name: 'IT Support (Other)', department: deptIT._id, keywords: ['projector', 'printer', 'scanner', 'audio', 'mic'], defaultPriority: 'LOW' },
      
      { name: 'Cleaning', department: deptHostel._id, keywords: ['clean', 'sweep', 'dust', 'garbage', 'trash', 'smell', 'washroom'], defaultPriority: 'MEDIUM' },
      { name: 'Hostel (Other)', department: deptHostel._id, keywords: ['room', 'shift', 'allotment', 'mess', 'laundry'], defaultPriority: 'LOW' },
      
      { name: 'Security', department: deptSecurity._id, keywords: ['guard', 'theft', 'lost', 'found', 'id card', 'access'], defaultPriority: 'HIGH' },
      { name: 'Transport', department: deptSecurity._id, keywords: ['bus', 'shuttle', 'timing', 'driver'], defaultPriority: 'MEDIUM' },
      { name: 'Parking', department: deptSecurity._id, keywords: ['parking', 'vehicle', 'car', 'bike', 'space'], defaultPriority: 'LOW' },
      
      { name: 'Medical/First Aid', department: deptMedical._id, keywords: ['emergency', 'injury', 'sick', 'fever', 'medicine', 'ambulance'], defaultPriority: 'HIGH' },
      
      { name: 'Library', department: deptAdmin._id, keywords: ['book', 'issue', 'fine', 'reading room'], defaultPriority: 'LOW' },
      { name: 'Sports Facilities', department: deptAdmin._id, keywords: ['ground', 'court', 'equipment', 'ball', 'gym'], defaultPriority: 'LOW' },
      { name: 'Canteen/Food Services', department: deptAdmin._id, keywords: ['food', 'canteen', 'mess', 'quality', 'hygiene'], defaultPriority: 'MEDIUM' },
      { name: 'Classroom', department: deptAdmin._id, keywords: ['board', 'chalk', 'marker', 'bench', 'duster'], defaultPriority: 'LOW' },
      { name: 'Administration', department: deptAdmin._id, keywords: ['fee', 'document', 'certificate', 'scholarship'], defaultPriority: 'MEDIUM' },
      { name: 'Other', department: deptAdmin._id, keywords: ['other', 'general', 'misc'], defaultPriority: 'LOW' }
    ];

    await Category.insertMany(categories);

    // Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const staffPassword = await bcrypt.hash('Staff@123', salt);
    const studentPassword = await bcrypt.hash('Student@123', salt);

    // Seed Admin
    await User.create({ 
      name: 'Rahul Kumar', 
      email: 'admin@campusflow.com', 
      password: adminPassword, 
      role: 'ADMIN',
      phone: '9876543210',
      designation: 'Chief Administrator',
      adminId: 'ADM-001'
    });

    // Seed Staff
    await User.insertMany([
      { name: 'Ravi Kumar', email: 'ravi.it@campusflow.com', password: staffPassword, role: 'STAFF', department: deptIT._id, staffId: 'STF-001', phone: '9876543211', designation: 'Senior IT Technician', specialization: 'Networking' },
      { name: 'Arjun Reddy', email: 'arjun.it@campusflow.com', password: staffPassword, role: 'STAFF', department: deptIT._id, staffId: 'STF-002', phone: '9876543212', designation: 'Hardware Support', specialization: 'Computers' },
      { name: 'Suresh Kumar', email: 'suresh.maint@campusflow.com', password: staffPassword, role: 'STAFF', department: deptMaintenance._id, staffId: 'STF-003', phone: '9876543213', designation: 'Head Electrician', specialization: 'Electrical' },
      { name: 'Rajesh Sharma', email: 'rajesh.plumb@campusflow.com', password: staffPassword, role: 'STAFF', department: deptMaintenance._id, staffId: 'STF-004', phone: '9876543214', designation: 'Plumber', specialization: 'Plumbing' },
      { name: 'Meena Iyer', email: 'meena.hostel@campusflow.com', password: staffPassword, role: 'STAFF', department: deptHostel._id, staffId: 'STF-005', phone: '9876543215', designation: 'Hostel Warden', specialization: 'Administration' },
      { name: 'Vikram Singh', email: 'vikram.sec@campusflow.com', password: staffPassword, role: 'STAFF', department: deptSecurity._id, staffId: 'STF-006', phone: '9876543216', designation: 'Security Head', specialization: 'Security' },
      { name: 'Dr. Anita Desai', email: 'anita.med@campusflow.com', password: staffPassword, role: 'STAFF', department: deptMedical._id, staffId: 'STF-007', phone: '9876543217', designation: 'Campus Doctor', specialization: 'General Medicine' }
    ]);

    // Seed Student
    await User.create({ name: 'Kowshik', email: 'student@campusflow.com', password: studentPassword, role: 'STUDENT', roomNumber: 'A-101', rollNumber: 'CS2026' });

    console.log('Data Imported successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();

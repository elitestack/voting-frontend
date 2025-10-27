// admin.js
import express from 'express';
import Admin from '../models/Admin.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all admins (protected route)
router.get('/', auth, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current admin profile
router.get('/profile', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new admin (protected route)
router.post('/create', auth, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this username already exists'
      });
    }

    // Create new admin
    const admin = new Admin({
      username,
      password
    });

    await admin.save();

    // Remove password from response
    const adminResponse = { ...admin.toObject() };
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: adminResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update admin profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username } = req.body;
    
    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { username },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: admin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.id);
    
    // Verify current password
    const isCorrectPassword = await admin.correctPassword(currentPassword, admin.password);
    if (!isCorrectPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete admin (protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.admin.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
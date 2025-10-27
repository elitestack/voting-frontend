// routes/voters.js
import express from 'express';
import Voter from '../models/Voter.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register new voter
router.post('/register', async (req, res) => {
  try {
    const { name, gender, dateOfBirth, nin, address, phone, email } = req.body;

    // Check if voter already exists
    const existingVoter = await Voter.findOne({ $or: [{ nin }, { email }] });
    if (existingVoter) {
      return res.status(400).json({
        success: false,
        message: 'Voter with this NIN or email already exists'
      });
    }

    // Create new voter
    const voter = new Voter({
      name,
      gender,
      dateOfBirth,
      nin,
      address,
      phone,
      email
    });

    // Check eligibility
    if (!voter.isEligible()) {
      return res.status(400).json({
        success: false,
        message: 'Voter must be at least 18 years old'
      });
    }

    await voter.save();

    res.status(201).json({
      success: true,
      message: 'Voter registered successfully',
      data: voter
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all voters (for admin) - PROTECTED
router.get('/', async (req, res) => {
  try {
    const voters = await Voter.find().sort({ registrationDate: -1 });
    res.json({
      success: true,
      data: voters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get voter by ID - PROTECTED
router.get('/:id', auth, async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }
    res.json({
      success: true,
      data: voter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify voter (admin only) - PROTECTED
router.put('/:id/verify', auth, async (req, res) => {
  try {
    const voter = await Voter.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.verified },
      { new: true }
    );
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    res.json({
      success: true,
      message: `Voter ${req.body.verified ? 'verified' : 'unverified'} successfully`,
      data: voter
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @route   PUT /api/profiles/update
// @desc    Update user profile
router.put('/update', protect, async (req, res) => {
  try {
    const { name, phone, examGoal } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name,
        phone,
        exam_goal: examGoal
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Profile updated successfully',
      user: data
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/profiles/kyc
// @desc    Complete KYC verification
router.post('/kyc', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, upiId } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_verified: true,
        // We could store bank details in a separate table if needed, 
        // but for now let's just mark as verified.
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'KYC completed successfully',
      user: data
    });
  } catch (error) {
    console.error('KYC Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/profiles/avatar
// @desc    Update user avatar URL
router.put('/avatar', protect, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar: avatarUrl,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Avatar updated successfully',
      user: data
    });
  } catch (error) {
    console.error('Update Avatar Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


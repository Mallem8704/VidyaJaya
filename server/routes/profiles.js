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

module.exports = router;

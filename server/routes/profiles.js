const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'), false);
        }
    }
});

/**
 * @route   PUT /api/profiles/avatar
 * @desc    Upload profile picture
 * @access  Private
 */
router.put('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${req.user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // 1. Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (storageError) throw storageError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // 3. Update Profile in DB
        const { error: dbError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', req.user.id);

        if (dbError) {
            // Fallback to 'avatar' column if 'avatar_url' doesn't exist
            const { error: fallbackError } = await supabase
                .from('profiles')
                .update({ avatar: publicUrl })
                .eq('id', req.user.id);
            
            if (fallbackError) throw dbError;
        }

        res.json({
            message: 'Profile picture updated successfully',
            avatar_url: publicUrl
        });
    } catch (error) {
        console.error('Avatar Upload Error:', error);
        res.status(500).json({ message: error.message || 'Failed to upload avatar' });
    }
});

/**
 * @route   PUT /api/profiles/select-avatar
 * @desc    Select a default avatar
 * @access  Private
 */
router.put('/select-avatar', protect, async (req, res) => {
    try {
        const { avatarUrl } = req.body;

        if (!avatarUrl) {
            return res.status(400).json({ message: 'Avatar URL is required' });
        }

        const { error: dbError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', req.user.id);

        if (dbError) {
            // Fallback
            const { error: fallbackError } = await supabase
                .from('profiles')
                .update({ avatar: avatarUrl })
                .eq('id', req.user.id);
            
            if (fallbackError) throw dbError;
        }

        res.json({
            message: 'Avatar selected successfully',
            avatar_url: avatarUrl
        });
    } catch (error) {
        console.error('Avatar Selection Error:', error);
        res.status(500).json({ message: error.message || 'Failed to select avatar' });
    }
});

/**
 * @route   PUT /api/profiles/update
 * @desc    Update profile details
 * @access  Private
 */
router.put('/update', protect, async (req, res) => {
    try {
        const { name, exam_goal, phone } = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update({ name, exam_goal, phone })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Profile updated successfully',
            user: data
        });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
});

module.exports = router;

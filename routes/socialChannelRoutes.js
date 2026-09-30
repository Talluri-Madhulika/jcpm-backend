const express = require('express');
const router = express.Router();

const SocialChannel = require('../models/SocialChannel');


// ===============================
// GET ALL ACTIVE CHANNELS
// ===============================
router.get('/', async (req, res) => {
  try {
    const channels = await SocialChannel.find({ isActive: true })
      .sort({ createdAt: 1 });

    res.json(channels);
  } catch (error) {
    console.error('Get Social Channels Error:', error);
    res.status(500).json({
      message: 'Failed to load social channels'
    });
  }
});


// ===============================
// GET ALL CHANNELS FOR ADMIN
// ===============================
router.get('/admin/all', async (req, res) => {
  try {
    const channels = await SocialChannel.find()
      .sort({ createdAt: -1 });

    res.json(channels);
  } catch (error) {
    console.error('Get Admin Social Channels Error:', error);
    res.status(500).json({
      message: 'Failed to load social channels'
    });
  }
});


// ===============================
// ADD CHANNEL
// ===============================
router.post('/', async (req, res) => {
  try {
    const {
      name,
      platform,
      url,
      description,
      icon,
      isActive
    } = req.body;

    if (!name || !platform || !url) {
      return res.status(400).json({
        message: 'Name, platform and URL are required'
      });
    }

    const channel = new SocialChannel({
      name,
      platform,
      url,
      description: description || '',
      icon: icon || 'video',
      isActive: isActive !== false
    });

    const savedChannel = await channel.save();

    res.status(201).json(savedChannel);
  } catch (error) {
    console.error('Add Social Channel Error:', error);
    res.status(500).json({
      message: 'Failed to add social channel'
    });
  }
});


// ===============================
// UPDATE CHANNEL
// ===============================
router.put('/:id', async (req, res) => {
  try {
    const updatedChannel = await SocialChannel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedChannel) {
      return res.status(404).json({
        message: 'Social channel not found'
      });
    }

    res.json(updatedChannel);
  } catch (error) {
    console.error('Update Social Channel Error:', error);
    res.status(500).json({
      message: 'Failed to update social channel'
    });
  }
});


// ===============================
// DELETE CHANNEL
// ===============================
router.delete('/:id', async (req, res) => {
  try {
    const deletedChannel = await SocialChannel.findByIdAndDelete(
      req.params.id
    );

    if (!deletedChannel) {
      return res.status(404).json({
        message: 'Social channel not found'
      });
    }

    res.json({
      message: 'Social channel deleted successfully'
    });
  } catch (error) {
    console.error('Delete Social Channel Error:', error);
    res.status(500).json({
      message: 'Failed to delete social channel'
    });
  }
});


module.exports = router;
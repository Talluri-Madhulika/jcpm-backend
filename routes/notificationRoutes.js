const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

// ADD NOTIFICATION
router.post("/", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    res.status(201).json({
      message: "Notification added successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding notification",
      error: error.message,
    });
  }
});

// GET ALL NOTIFICATIONS
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({
      createdAt: -1,
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
});

// UPDATE NOTIFICATION
router.put("/:id", async (req, res) => {
  try {
    const updatedNotification =
      await Notification.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedNotification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification updated successfully",
      data: updatedNotification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating notification",
      error: error.message,
    });
  }
});

// DELETE NOTIFICATION
router.delete("/:id", async (req, res) => {
  try {
    const deletedNotification =
      await Notification.findByIdAndDelete(req.params.id);

    if (!deletedNotification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting notification",
      error: error.message,
    });
  }
});

module.exports = router;
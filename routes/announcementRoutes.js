const express = require("express");
const router = express.Router();

const Announcement = require("../models/Announcement");

// ADD ANNOUNCEMENT
router.post("/", async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();

    res.status(201).json({
      message: "Announcement added successfully",
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding announcement",
      error: error.message,
    });
  }
});

// GET ALL ANNOUNCEMENTS
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({
      createdAt: -1,
    });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching announcements",
      error: error.message,
    });
  }
});

// UPDATE ANNOUNCEMENT
router.put("/:id", async (req, res) => {
  try {
    const updatedAnnouncement =
      await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      message: "Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating announcement",
      error: error.message,
    });
  }
});

// DELETE ANNOUNCEMENT
router.delete("/:id", async (req, res) => {
  try {
    const deletedAnnouncement =
      await Announcement.findByIdAndDelete(req.params.id);

    if (!deletedAnnouncement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting announcement",
      error: error.message,
    });
  }
});

module.exports = router;
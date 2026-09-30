const express = require("express");
const router = express.Router();

const ShortMessage = require("../models/ShortMessage");

// ADD SHORT MESSAGE
router.post("/", async (req, res) => {
  try {
    const shortMessage = new ShortMessage(req.body);
    await shortMessage.save();

    res.status(201).json({
      message: "Short message added successfully",
      data: shortMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding short message",
      error: error.message,
    });
  }
});

// GET ALL SHORT MESSAGES
router.get("/", async (req, res) => {
  try {
    const shortMessages = await ShortMessage.find().sort({
      createdAt: -1,
    });

    res.status(200).json(shortMessages);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching short messages",
      error: error.message,
    });
  }
});

// UPDATE SHORT MESSAGE
router.put("/:id", async (req, res) => {
  try {
    const updatedShortMessage =
      await ShortMessage.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedShortMessage) {
      return res.status(404).json({
        message: "Short message not found",
      });
    }

    res.status(200).json({
      message: "Short message updated successfully",
      data: updatedShortMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating short message",
      error: error.message,
    });
  }
});

// DELETE SHORT MESSAGE
router.delete("/:id", async (req, res) => {
  try {
    const deletedShortMessage =
      await ShortMessage.findByIdAndDelete(req.params.id);

    if (!deletedShortMessage) {
      return res.status(404).json({
        message: "Short message not found",
      });
    }

    res.status(200).json({
      message: "Short message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting short message",
      error: error.message,
    });
  }
});

module.exports = router;
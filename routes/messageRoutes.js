const express = require("express");
const router = express.Router();

const Message = require("../models/Message");

// ADD MESSAGE
router.post("/", async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();

    res.status(201).json({
      message: "Message added successfully",
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding message",
      error: error.message,
    });
  }
});

// GET ALL MESSAGES
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
});

// UPDATE MESSAGE
router.put("/:id", async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    res.status(200).json({
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating message",
      error: error.message,
    });
  }
});

// DELETE MESSAGE
router.delete("/:id", async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting message",
      error: error.message,
    });
  }
});

module.exports = router;
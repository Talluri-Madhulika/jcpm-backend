const express = require("express");
const router = express.Router();

const ActionSong = require("../models/ActionSong");

// =========================
// ADD ACTION SONG
// =========================

router.post("/", async (req, res) => {
  try {
    const actionSong = new ActionSong(req.body);

    await actionSong.save();

    res.status(201).json({
      message: "Action song added successfully",
      data: actionSong,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error adding action song",
      error: error.message,
    });

  }
});


// =========================
// GET ALL ACTION SONGS
// =========================

router.get("/", async (req, res) => {
  try {

    const actionSongs = await ActionSong.find()
      .sort({ createdAt: -1 });

    res.status(200).json(actionSongs);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching action songs",
      error: error.message,
    });

  }
});


// =========================
// UPDATE ACTION SONG
// =========================

router.put("/:id", async (req, res) => {
  try {

    const updatedActionSong =
      await ActionSong.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedActionSong) {

      return res.status(404).json({
        message: "Action song not found",
      });

    }

    res.status(200).json({
      message: "Action song updated successfully",
      data: updatedActionSong,
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating action song",
      error: error.message,
    });

  }
});


// =========================
// DELETE ACTION SONG
// =========================

router.delete("/:id", async (req, res) => {
  try {

    const deletedActionSong =
      await ActionSong.findByIdAndDelete(req.params.id);

    if (!deletedActionSong) {

      return res.status(404).json({
        message: "Action song not found",
      });

    }

    res.status(200).json({
      message: "Action song deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting action song",
      error: error.message,
    });

  }
});


module.exports = router;
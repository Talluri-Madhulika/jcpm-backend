const express = require("express");
const router = express.Router();

const Song = require("../models/Song");

// ADD SONG
router.post("/", async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();

    res.status(201).json({
      message: "Song added successfully",
      song,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding song",
      error: error.message,
    });
  }
});

// GET ALL SONGS
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching songs",
      error: error.message,
    });
  }
});
// UPDATE SONG
router.put("/:id", async (req, res) => {
  try {
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSong) {
      return res.status(404).json({
        message: "Song not found"
      });
    }

    res.status(200).json({
      message: "Song updated successfully",
      song: updatedSong
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating song",
      error: error.message
    });
  }
});
// DELETE SONG
router.delete("/:id", async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Song deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting song",
      error: error.message,
    });
  }
});

module.exports = router;
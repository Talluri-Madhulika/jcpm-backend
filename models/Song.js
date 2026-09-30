const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    titleTelugu: {
      type: String,
      required: true,
    },
    titleEnglish: {
      type: String,
      required: true,
    },
    lyricsTelugu: {
      type: String,
      required: true,
    },
    lyricsEnglish: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    youtubeLink: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Song", songSchema);
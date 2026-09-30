const mongoose = require("mongoose");

const actionSongSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    youtubeLink: {
      type: String,
      default: "",
    },

    audioLink: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ActionSong", actionSongSchema);
const mongoose = require('mongoose');

const dailyPromiseSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true
    },

    reference: {
      type: String,
      required: true
    },

    verse: {
      type: String,
      required: true
    },

    note: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DailyPromise', dailyPromiseSchema);
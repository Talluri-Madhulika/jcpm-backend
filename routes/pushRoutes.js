const express = require("express");
const router = express.Router();

const PushSubscription = require("../models/PushSubscription");

// SAVE PUSH SUBSCRIPTION
router.post("/subscribe", async (req, res) => {
  try {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        message: "Invalid push subscription",
      });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      subscription,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json({
      message: "Push subscription saved successfully",
    });
  } catch (error) {
    console.error("Subscription Error:", error);

    res.status(500).json({
      message: "Error saving push subscription",
      error: error.message,
    });
  }
});

module.exports = router;
const cron = require("node-cron");
const webpush = require("web-push");

const Notification = require("./models/Notification");
const PushSubscription = require("./models/PushSubscription");

require("dotenv").config();

// =====================================================
// WEB PUSH CONFIGURATION
// =====================================================

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// =====================================================
// SEND PUSH NOTIFICATION
// =====================================================

async function sendPushNotification(
  subscription,
  notification
) {
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.message,
    icon: "/assets/icons/icon-192x192.png"
  });

  try {
    await webpush.sendNotification(
      subscription,
      payload
    );

    console.log(
      `Notification sent: ${notification.title}`
    );

  } catch (error) {

    console.error(
      "Push notification error:",
      error.statusCode || error.message
    );

    // Remove expired subscriptions
    if (
      error.statusCode === 404 ||
      error.statusCode === 410
    ) {
      try {
        await PushSubscription.deleteOne({
          endpoint: subscription.endpoint
        });

        console.log(
          "Expired push subscription removed."
        );

      } catch (deleteError) {
        console.error(
          "Error removing subscription:",
          deleteError.message
        );
      }
    }
  }
}

// =====================================================
// CHECK SCHEDULED NOTIFICATIONS
// =====================================================

// Runs every minute
cron.schedule(
  "* * * * *",
  async () => {

    try {

      const now = new Date();

      // India time (IST)
      const indiaDate =
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          }
        ).format(now);

      const indiaTime =
        new Intl.DateTimeFormat(
          "en-GB",
          {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          }
        ).format(now);

      console.log(
        `Checking notifications: ${indiaDate} ${indiaTime}`
      );

      const notifications =
        await Notification.find({
          active: true
        });

      if (notifications.length === 0) {
        return;
      }

      const subscriptions =
        await PushSubscription.find();

      if (subscriptions.length === 0) {
        return;
      }

      for (const notification of notifications) {

        let shouldSend = false;

        // =================================================
        // ONCE
        // =================================================

        if (
          notification.repeat === "Once"
        ) {

          if (
            notification.date === indiaDate &&
            notification.time === indiaTime
          ) {
            shouldSend = true;
          }
        }

        // =================================================
        // DAILY
        // =================================================

        else if (
          notification.repeat === "Daily"
        ) {

          if (
            notification.time === indiaTime
          ) {
            shouldSend = true;
          }
        }

        // =================================================
        // WEEKLY
        // =================================================

        else if (
          notification.repeat === "Weekly"
        ) {

          if (
            notification.time === indiaTime
          ) {

            const scheduledDate =
              new Date(notification.date);

            const currentDate =
              new Date(indiaDate);

            if (
              scheduledDate.getDay() ===
              currentDate.getDay()
            ) {
              shouldSend = true;
            }
          }
        }

        // =================================================
        // SEND
        // =================================================

        if (shouldSend) {

          console.log(
            `Sending notification: ${notification.title}`
          );

          for (
            const subscription
            of subscriptions
          ) {

            await sendPushNotification(
              subscription,
              notification
            );
          }

          // Once notification should not run again
          if (
            notification.repeat === "Once"
          ) {

            notification.active = false;

            await notification.save();

            console.log(
              `One-time notification completed: ${notification.title}`
            );
          }
        }
      }

    } catch (error) {

      console.error(
        "Notification scheduler error:",
        error.message
      );
    }
  },
  {
    timezone: "Asia/Kolkata"
  }
);

console.log(
  "Notification Scheduler Started - IST"
);
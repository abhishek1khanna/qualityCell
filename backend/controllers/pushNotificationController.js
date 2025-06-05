import admin from "firebase-admin";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import gangModel from "../models/gangModel.js";

// Get __dirname in ES module syntax
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

// Resolve file path to the JSON file
const filePath = path.join(__dirname, '../gang-management-2126f-firebase-adminsdk-ns7i0-4bc4fefbf1.json');
const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Function to send push notification using HTTP v1
export const sendPushNotification = async (deviceToken, title, message) => {
    const messagePayload = {
        token: deviceToken,
        notification: {
            title: title,
            body: message,
        },
        data: {
            key1: "value1",
            key2: "value2"
        }
    };

    try {
        const response = await admin.messaging().send(messagePayload);
        console.log("Notification sent successfully:", response);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

// Endpoint to trigger push notification
export const notifyMobile = async (req, res) => {
    try {
        const { deviceToken, title, message } = req.body;
        if (!deviceToken || !title || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await sendPushNotification(deviceToken, title, message);
        res.status(200).json({ success: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
};


export const notifyUpdateLocation = async (req, res) => {
    try {

        const allGangs = await gangModel.find({
            vanAvailable: { $ne: "yes" },
            fb_token: { $exists: true, $ne: "" } // Check if fb_token exists and is not empty
        });

      if (!allGangs || allGangs.length === 0) {
        return res.status(404).json({ error: "No gangs found" });
      }

    // Send notifications to each gang
    const notificationPromises = allGangs.map(async (gang) => {
        if (gang.fb_token) {  // Check if fb_token exists
            await sendPushNotification(gang.fb_token, "mobile location update", 'mobile location updated');
        }
    });

    // Wait for all notifications to be sent
    await Promise.all(notificationPromises); 
    return res.status(200).json({ success: 'Notification sent successfully' });
} catch (error) {
    return res.status(500).json({ error: 'Failed to send notification',error });
}

};

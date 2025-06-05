import nodemailer from "nodemailer";
import fs from 'fs';
import path from 'path';

export async function sendEmail(emailTo, subject, description, imagePath, attachments = []) {
    try {
        // Create a transporter (Use your SMTP credentials)
        const transporter = nodemailer.createTransport({
            service: "gmail", // Or use "smtp.yourmailserver.com"
            auth: {
                user: "abhi1khanna@gmail.com", // Replace with your email
                pass: "uikq wlnu etlq pemc", // Replace with your app password
            },
        });

        // Read the image file
        const imageAttachment = imagePath
            ? {
                  filename: path.basename(imagePath),
                  path: imagePath,
                  cid: "unique-image-cid", // Content ID for embedding
              }
            : null;

        // Email options
        const mailOptions = {
            from: '"Abhishek Khanna" <abhi1khanna@gmail.com>', // Sender
            to: emailTo, // Recipient
            subject: subject,
            html: `
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <p>${description}</p>
                    <p>Best regards,<br><strong>UPPCL</strong></p>
                </body>
                </html>
            `,
            attachments: attachments.length ? attachments : undefined
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
       // return { success: true, message: "Email sent successfully" };
    } catch (error) {
        console.error("Email Error:", error);
       // return { success: false, message: error.message };
    }
}

// Example usage

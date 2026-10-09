
import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (
            typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof message !== 'string' ||
            !name.trim() ||
            !email.trim() ||
            !message.trim()
        ) {
            return res.status(400).json({
                error: 'Please fill in all fields.'
            });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const { error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            replyTo: email.trim(),
            subject: `Mission Control message from ${name.trim()}`,
            text: message.trim()
        });

        if (error) {
            console.error('Email delivery error:', error);
            return res.status(502).json({
                error: 'Transmission failed. Please try again.'
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Something went wrong. Please try again.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Mission Control backend running on port ${PORT}`);
});
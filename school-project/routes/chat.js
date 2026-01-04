const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const CONFIG_PATH = path.join(__dirname, '../config/chatbot.json');

// Helper to load config
const loadConfig = () => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading chatbot config:', e);
    }
    return { apiKey: '', context: '' };
};

// POST /api/chat
router.post('/', async (req, res) => {
    const { message, history } = req.body;
    const config = loadConfig();

    if (!config.apiKey) {
        return res.status(503).json({
            error: 'Chatbot not configured',
            message: 'El asistente no está configurado (Falta API Key).'
        });
    }

    if (!message) {
        return res.status(400).json({ error: 'Message required' });
    }

    try {
        const openai = new OpenAI({ apiKey: config.apiKey });

        // Construct messages
        const messages = [
            { role: 'system', content: config.context || 'You are a helpful school assistant.' }
        ];

        // Add history if valid
        if (Array.isArray(history)) {
            history.forEach(msg => {
                if (msg.role && msg.content) {
                    messages.push({ role: msg.role, content: msg.content });
                }
            });
        }

        // Add current user message
        messages.push({ role: 'user', content: message });

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 300,
        });

        const reply = completion.choices[0].message.content;

        res.json({ reply });

    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({
            error: 'AI Service Error',
            message: 'Error al conectar con el asistente. Intente más tarde.'
        });
    }
});

module.exports = router;

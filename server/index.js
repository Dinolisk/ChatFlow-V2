import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const allowedOrigins = [
  'http://localhost:5173',
  'https://chatflowv2.netlify.app',
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Fältet "message" saknas eller är ogiltigt.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Du är en vänlig chattbot som heter Patrik. Svara kort och avslappnat på svenska, max 2 meningar.',
        },
        { role: 'user', content: message },
      ],
      max_tokens: 150,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) return res.status(500).json({ error: 'Tomt svar från AI.' });

    res.json({ reply });
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'rate_limit' });
    }
    console.error('OpenAI-fel:', err.message);
    res.status(500).json({ error: 'Något gick fel på servern.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend körs på http://localhost:${PORT}`);
});

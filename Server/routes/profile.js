import express from 'express';
import User from '../model/userSchema.js';

const router = express.Router();

router.post('/search/username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username required' });
    }

    const user = await User.findOne({ origname: username.trim() });

    res.json({ exists: !!user });
  } catch (err) {
    console.error('Username check failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

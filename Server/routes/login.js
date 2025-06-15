import express from 'express';
import admin from '../admin.js'; 
import User from '../model/userSchema.js'; 

const router = express.Router();


router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    console.log("user mujhe mila hai",user);

    if (!user) {
      return res.status(400).json({ error: 'User not found. Please register.' });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session regeneration failed' });

      req.session.userId = user._id;
      if(user.name) req.session.username = user.name;

      req.session.save((err) => {
        if (err) return res.status(500).json({ error: 'Session save failed' });
        return res.json({ success: true ,needsProfileSetup: !user.name });
      });
    });
    

  } catch (err) {
    console.error('Normal login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, name, email } = decoded;

    let user = await User.findOne({ googleid: uid });

    
    if (!user) {
       return res.status(400).json({ error: 'User not found. Please register.' });
    }

     req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session regeneration failed' });

      req.session.userId = user._id;
     if(user.name) req.session.username = user.name ;

      req.session.save((err) => {
        if (err) return res.status(500).json({ error: 'Session save failed' });

        return res.json({
          success: true,
          needsProfileSetup: !user.name,
        });
      });
    });

  } catch (err) {
    console.error('Google login error:', err);
    return res.status(400).json({ success: false, message: 'Invalid Google token' });
  }
});

export default router;

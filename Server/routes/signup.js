import express from 'express'
import admin from '../admin.js'
import User from "../model/userSchema.js"
const router = express.Router();
router.post("/google",async(req,res)=>{

     const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid,name,  email} = decodedToken;

     const inst = new User({
        origname:name,
        googleid:uid,
        
        email: email
      });
     await inst.save();
     
        req.session.regenerate((err) => {
          if (err) {
            return res.status(500).send("Session regeneration failed");
          }
    
          // req.session.username = name;
          req.session.userId = inst._id;

          
          req.session.save(err => {
            if (err) {
              console.error("Session save error:", err);
             return res.status(500).json({ error: "Session save failed" });

            }
              res.json({
      success: true,
      needsProfileSetup:true,
    });
          });
        });
    
  } catch (error) {
    console.error('Token verification failed', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }

})
router.post("/",async(req,res)=>{
    const name = req.body.name;
      const email = req.body.email;
      const password=req.body.password;
      const confirmPassword=req.body.confirmPassword;
      if(password!=confirmPassword) {
       return  res.json({error:"password not equal try agian and put correct password"});
      }
      const me= await User.findOne({email:email});
      if(me){
        return  res.json({error:"email already exist"});
      }
    
      console.log(name);
      console.log(email);
    
      const inst = new User({
        origname: name,
        email: email,
        password:password,
      });
    
      try {
        await inst.save();
        console.log(inst);
    
        req.session.regenerate((err) => {
          if (err) {
            return res.status(500).send("Session regeneration failed");
          }
    
          // req.session.username = name;
          req.session.userId = inst._id;

          
          req.session.save(err => {
            if (err) {
              console.error("Session save error:", err);
             return res.status(500).json({ error: "Session save failed" });

            }
              return res.json({ success: true });
          });
        });
    
      } catch (err) {
        console.error("Signup error:", err);
      return res.status(500).json({ error: "Signup failed" });

      }

})
export default router;
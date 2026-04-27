import { Router } from 'express';
import { db } from '../db.js';
import { verifyGoogleToken, createToken } from '../utils/auth.js';

const router = Router();

router.post('/google', async (req, res) => {
  const { credential, role } = req.body;
  const payload = await verifyGoogleToken(credential);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  const { sub, email, name, picture } = payload;
  let user = db.get().users.find(u => u.id === sub);

  if (!user) {
    user = { id: sub!, email: email!, name: name!, picture: picture!, role: role || 'student' };
    const data = db.get();
    data.users.push(user);
    db.set(data);
  }

  const token = createToken(user);
  res.json({ token, user });
});

export default router;

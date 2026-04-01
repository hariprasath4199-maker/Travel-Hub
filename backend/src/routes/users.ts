import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { AppUser } from '../types.js';

const router = Router();
const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..', '..');
const USERS_FILE = path.join(ROOT_DIR, 'input', 'users.txt');

function readUsers(): AppUser[] {
  try { const c = fs.readFileSync(USERS_FILE, 'utf-8').trim(); return c ? JSON.parse(c) : []; }
  catch { return []; }
}

// GET /api/users
router.get('/', (_req, res) => { res.json(readUsers()); });

// GET /api/users/by-role/:role
router.get('/by-role/:role', (req, res) => {
  const users = readUsers().filter(u => u.role === req.params.role.toUpperCase());
  res.json(users);
});

export default router;

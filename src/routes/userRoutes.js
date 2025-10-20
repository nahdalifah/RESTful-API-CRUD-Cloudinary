import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  uploadAvatar
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);
router.post('/avatar', verifyToken, upload.single('file'), uploadAvatar);

export default router;

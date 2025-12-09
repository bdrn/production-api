import express from 'express';
import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controllers';
import { authenticateToken, requireRole } from '#middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticateToken, fetchAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUser);

export default router;

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();

function getPrisma(req: Request): PrismaClient {
  return req.app.locals.prisma;
}

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  if (!user.isActive) return res.status(401).json({ message: 'Account deactivated' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const payload = { sub: user.id, email: user.email, role: user.role, branchId: user.branchId, firstName: user.firstName, lastName: user.lastName };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, branchId: user.branchId, mustResetPassword: user.mustResetPassword },
  });
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', authenticate, async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(400).json({ message: 'Current password incorrect' });

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash, mustResetPassword: false } });
  res.json({ message: 'Password updated' });
});

// POST /api/v1/auth/logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  await prisma.refreshToken.updateMany({ where: { userId: req.user!.id, isRevoked: false }, data: { isRevoked: true } });
  res.json({ message: 'Logged out' });
});

export default router;

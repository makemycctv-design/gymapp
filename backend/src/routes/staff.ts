import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.use(requireRole('SUPER_ADMIN'));

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

// POST /api/v1/staff/create-manager - Super Admin creates branch managers
router.post('/create-manager', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { firstName, lastName, email, phone, branchId } = req.body;

  if (!firstName || !lastName || !email || !phone || !branchId) {
    return res.status(400).json({ message: 'firstName, lastName, email, phone, and branchId are required' });
  }

  // Check existing
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (exists) return res.status(409).json({ message: 'User with this email or phone already exists' });

  // Verify branch exists
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) return res.status(400).json({ message: 'Branch not found' });

  // Generate temp password
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let tempPass = '';
  for (let i = 0; i < 10; i++) tempPass += chars[Math.floor(Math.random() * chars.length)];
  const hash = await bcrypt.hash(tempPass, 12);

  const user = await prisma.user.create({
    data: { email, phone, passwordHash: hash, firstName, lastName, role: 'BRANCH_MANAGER', branchId, mustResetPassword: true },
  });

  res.status(201).json({
    user: { id: user.id, email, firstName, lastName, role: 'BRANCH_MANAGER', branch: branch.name },
    credentials: { email, temporaryPassword: tempPass, mustResetPassword: true },
  });
});

// GET /api/v1/staff - List all staff (managers + trainers)
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const staff = await prisma.user.findMany({
    where: { role: { in: ['BRANCH_MANAGER', 'PERSONAL_TRAINER', 'FLOOR_TRAINER'] }, isActive: true },
    select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, branchId: true, lastLoginAt: true, branch: { select: { name: true, code: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(staff);
});

export default router;

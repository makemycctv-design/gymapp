import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

// GET /api/v1/trainers - list all trainers
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  // Super Admin sees all, others see their branch only
  const where = req.user!.branchId
    ? { user: { branchId: req.user!.branchId, isActive: true } }
    : { user: { isActive: true } };

  const trainers = await prisma.trainerProfile.findMany({
    where,
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, branchId: true } } },
  });
  res.json(trainers);
});

// POST /api/v1/trainers - create a new trainer
router.post('/', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { firstName, lastName, email, phone, role, specializations, certifications, bio, maxClients, branchId } = req.body;

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ message: 'firstName, lastName, email, phone are required' });
  }

  // Check if user exists
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (exists) return res.status(409).json({ message: 'User with this email or phone already exists' });

  // Generate temp password
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let tempPass = '';
  for (let i = 0; i < 10; i++) tempPass += chars[Math.floor(Math.random() * chars.length)];
  const hash = await bcrypt.hash(tempPass, 12);

  const trainerRole = role === 'FLOOR_TRAINER' ? 'FLOOR_TRAINER' : 'PERSONAL_TRAINER';
  const assignedBranch = branchId || req.user!.branchId;

  const user = await prisma.user.create({
    data: { email, phone, passwordHash: hash, firstName, lastName, role: trainerRole, branchId: assignedBranch, mustResetPassword: true },
  });

  const profile = await prisma.trainerProfile.create({
    data: {
      userId: user.id,
      specializations: specializations || [],
      certifications: certifications || [],
      bio: bio || '',
      maxClients: maxClients || 15,
    },
  });

  res.status(201).json({
    trainer: { id: profile.id, userId: user.id, firstName, lastName, email, role: trainerRole },
    credentials: { email, temporaryPassword: tempPass, mustResetPassword: true },
  });
});

// GET /api/v1/trainers/my-clients
router.get('/my-clients', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  // Find members assigned to this trainer
  const assignedMembers = await prisma.memberProfile.findMany({
    where: { assignedTrainerId: req.user!.id },
    include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } }, subscriptions: { where: { status: 'ACTIVE' }, include: { package: { select: { name: true } } }, take: 1 } },
  });
  res.json(assignedMembers);
});

export default router;

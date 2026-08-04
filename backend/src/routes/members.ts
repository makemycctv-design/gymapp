import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

// GET /api/v1/members - List members for branch
router.get('/', requireRole('BRANCH_MANAGER'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const members = await prisma.memberProfile.findMany({
    where: { branchId: req.user!.branchId! },
    include: { user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true, isActive: true, lastLoginAt: true } }, subscriptions: { where: { status: 'ACTIVE' }, include: { package: { select: { name: true } } }, take: 1 } },
    orderBy: { joinDate: 'desc' },
  });
  res.json(members);
});

// GET /api/v1/members/search?q=
router.get('/search', requireRole('BRANCH_MANAGER'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const q = (req.query.q as string) || '';
  if (!q) return res.json([]);
  const members = await prisma.memberProfile.findMany({
    where: {
      branchId: req.user!.branchId!,
      OR: [
        { memberId: { contains: q, mode: 'insensitive' } },
        { user: { phone: { contains: q } } },
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
        { user: { lastName: { contains: q, mode: 'insensitive' } } },
      ],
    },
    include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } },
    take: 10,
  });
  res.json(members);
});

// POST /api/v1/members - Create new member
router.post('/', requireRole('BRANCH_MANAGER'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { email, phone, firstName, lastName, dateOfBirth, gender, packageId, trainerTier } = req.body;

  if (!email || !phone || !firstName || !lastName || !packageId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (exists) return res.status(409).json({ message: 'User with this email or phone already exists' });

  // Generate temp password
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let tempPass = '';
  for (let i = 0; i < 10; i++) tempPass += chars[Math.floor(Math.random() * chars.length)];
  const hash = await bcrypt.hash(tempPass, 12);

  // Generate member ID
  const branch = await prisma.branch.findUnique({ where: { id: req.user!.branchId! }, select: { code: true } });
  const count = await prisma.memberProfile.count({ where: { branchId: req.user!.branchId! } });
  const memberId = `GYM-${branch!.code}-${String(count + 1).padStart(4, '0')}`;

  // Get package
  const pkg = await prisma.membershipPackage.findUnique({ where: { id: packageId } });
  if (!pkg) return res.status(400).json({ message: 'Invalid package' });

  const user = await prisma.user.create({
    data: { email, phone, passwordHash: hash, firstName, lastName, role: 'MEMBER', branchId: req.user!.branchId!, mustResetPassword: true },
  });

  const profile = await prisma.memberProfile.create({
    data: { userId: user.id, branchId: req.user!.branchId!, memberId, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, gender, trainerTier: trainerTier || 'FLOOR' },
  });

  // Create subscription
  const startDate = new Date();
  const endDate = new Date(); endDate.setDate(endDate.getDate() + pkg.durationDays);
  await prisma.memberSubscription.create({
    data: { memberId: profile.id, packageId, branchId: req.user!.branchId!, startDate, endDate, status: 'ACTIVE' },
  });

  res.status(201).json({ memberId, user: { id: user.id, email, firstName, lastName }, credentials: { email, temporaryPassword: tempPass, mustResetPassword: true } });
});

// GET /api/v1/members/:id
router.get('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const member = await prisma.memberProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true } },
      subscriptions: { include: { package: true }, orderBy: { createdAt: 'desc' } },
      measurements: { orderBy: { date: 'desc' }, take: 10 },
      attendance: { orderBy: { checkInTime: 'desc' }, take: 10 },
    },
  });
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

export default router;

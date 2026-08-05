import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

async function getBranchId(prisma: PrismaClient, user: any): Promise<string | null> {
  if (user.branchId) return user.branchId;
  // Super Admin - use first branch
  const branch = await prisma.branch.findFirst({ where: { isActive: true } });
  return branch ? branch.id : null;
}

// GET /api/v1/members
router.get('/', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);

  // Super Admin sees all members, Branch Manager sees their branch only
  const where: any = { user: { isActive: true } };
  if (req.user!.branchId) {
    where.branchId = req.user!.branchId;
  }

  const members = await prisma.memberProfile.findMany({
    where,
    include: { user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true, isActive: true, lastLoginAt: true } }, subscriptions: { where: { status: 'ACTIVE' }, include: { package: { select: { name: true } } }, take: 1 }, branch: { select: { name: true, code: true } } },
    orderBy: { joinDate: 'desc' },
  });
  res.json(members);
});

// GET /api/v1/members/search?q=
router.get('/search', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const q = (req.query.q as string) || '';
  if (!q) return res.json([]);

  const branchId = await getBranchId(prisma, req.user!);
  const where: any = {
    OR: [
      { memberId: { contains: q, mode: 'insensitive' } },
      { user: { phone: { contains: q } } },
      { user: { firstName: { contains: q, mode: 'insensitive' } } },
      { user: { lastName: { contains: q, mode: 'insensitive' } } },
    ],
  };
  if (branchId) where.branchId = branchId;

  const members = await prisma.memberProfile.findMany({
    where,
    include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } },
    take: 10,
  });
  res.json(members);
});

// POST /api/v1/members - Create new member
router.post('/', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { email, phone, firstName, lastName, dateOfBirth, gender, packageId, trainerTier, assignedTrainerId, branchId: requestBranchId } = req.body;

  if (!email || !phone || !firstName || !lastName || !packageId) {
    return res.status(400).json({ message: 'Missing required fields: email, phone, firstName, lastName, packageId' });
  }

  try {
    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (exists) return res.status(409).json({ message: 'User with this email or phone already exists' });

    // Get branch
    const branchId = requestBranchId || await getBranchId(prisma, req.user!);
    if (!branchId) return res.status(400).json({ message: 'No branch available. Create a branch first.' });

    // Generate temp password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    let tempPass = '';
    for (let i = 0; i < 10; i++) tempPass += chars[Math.floor(Math.random() * chars.length)];
    const hash = await bcrypt.hash(tempPass, 12);

    // Generate member ID
    const branch = await prisma.branch.findUnique({ where: { id: branchId }, select: { code: true } });
    const count = await prisma.memberProfile.count({ where: { branchId } });
    const memberId = `GYM-${branch!.code}-${String(count + 1).padStart(4, '0')}`;

    // Get package
    const pkg = await prisma.membershipPackage.findUnique({ where: { id: packageId } });
    if (!pkg) return res.status(400).json({ message: 'Invalid package selected' });

    const user = await prisma.user.create({
      data: { email, phone, passwordHash: hash, firstName, lastName, role: 'MEMBER', branchId, mustResetPassword: true },
    });

    const profile = await prisma.memberProfile.create({
      data: { userId: user.id, branchId, memberId, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, gender: gender || null, trainerTier: trainerTier || 'FLOOR' },
    });

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.durationDays);
    await prisma.memberSubscription.create({
      data: { memberId: profile.id, packageId, branchId, startDate, endDate, status: 'ACTIVE' },
    });

    // Assign personal trainer if selected
    if (trainerTier === 'PERSONAL' && assignedTrainerId) {
      await prisma.memberProfile.update({
        where: { id: profile.id },
        data: { assignedTrainerId },
      });
    }

    res.status(201).json({
      memberId,
      user: { id: user.id, email, firstName, lastName },
      credentials: { email, temporaryPassword: tempPass, mustResetPassword: true },
    });
  } catch (err: any) {
    console.error('Create member error:', err);
    res.status(500).json({ message: err.message || 'Failed to create member' });
  }
});


// GET /api/v1/members/my-subscription
router.get("/my-subscription", async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const member = await prisma.memberProfile.findFirst({ where: { userId: req.user!.id } });
  if (!member) return res.status(404).json({ message: "Member profile not found" });
  const subscription = await prisma.memberSubscription.findFirst({ where: { memberId: member.id, status: "ACTIVE" }, include: { package: true, branch: true }, orderBy: { createdAt: "desc" } });
  res.json(subscription);
});

// POST /api/v1/members/reset-password/:userId - Reset member password
router.post('/reset-password/:userId', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let tempPass = '';
  for (let i = 0; i < 10; i++) tempPass += chars[Math.floor(Math.random() * chars.length)];

  const hash = await bcrypt.hash(tempPass, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash, mustResetPassword: true } });

  res.json({ message: 'Password reset successfully', credentials: { email: user.email, temporaryPassword: tempPass } });
});

// POST /api/v1/members/delete/:userId - Deactivate a member
router.post('/delete/:userId', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { userId } = req.params;
  try {
    await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
    res.json({ message: 'Member deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete member' });
  }
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



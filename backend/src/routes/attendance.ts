import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

// POST /api/v1/attendance/front-desk
router.post('/front-desk', requireRole('BRANCH_MANAGER'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { phoneOrMemberId } = req.body;

  const member = await prisma.memberProfile.findFirst({
    where: {
      branchId: req.user!.branchId!,
      OR: [{ memberId: phoneOrMemberId }, { user: { phone: phoneOrMemberId } }],
    },
    include: { user: { select: { firstName: true, lastName: true, isActive: true } }, subscriptions: { where: { status: 'ACTIVE' }, take: 1 } },
  });

  if (!member) return res.status(404).json({ message: 'Member not found' });
  if (!member.user.isActive) return res.status(400).json({ message: 'Member account deactivated' });
  if (member.subscriptions.length === 0) return res.status(400).json({ message: 'No active subscription' });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const existing = await prisma.attendance.count({ where: { memberId: member.id, checkInTime: { gte: today } } });
  if (existing > 0) return res.status(400).json({ message: 'Already checked in today' });

  const attendance = await prisma.attendance.create({
    data: { memberId: member.id, branchId: req.user!.branchId!, method: 'FRONT_DESK', verifiedById: req.user!.id },
  });

  res.status(201).json({ attendance, member: { memberId: member.memberId, name: `${member.user.firstName} ${member.user.lastName}` } });
});

// POST /api/v1/attendance/geo-fence
router.post('/geo-fence', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { latitude, longitude } = req.body;

  const member = await prisma.memberProfile.findFirst({
    where: { userId: req.user!.id },
    include: { branch: true, subscriptions: { where: { status: 'ACTIVE' }, take: 1 } },
  });

  if (!member) return res.status(404).json({ message: 'Member profile not found' });
  if (member.subscriptions.length === 0) return res.status(400).json({ message: 'No active subscription' });

  // Haversine distance
  const R = 6371000;
  const dLat = (member.branch.latitude - latitude) * Math.PI / 180;
  const dLon = (member.branch.longitude - longitude) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(latitude * Math.PI / 180) * Math.cos(member.branch.latitude * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (distance > member.branch.geoFenceRadiusMeters) {
    return res.status(400).json({ message: `You are ${Math.round(distance)}m away. Must be within ${member.branch.geoFenceRadiusMeters}m of the gym.` });
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const existing = await prisma.attendance.count({ where: { memberId: member.id, checkInTime: { gte: today } } });
  if (existing > 0) return res.status(400).json({ message: 'Already checked in today' });

  const attendance = await prisma.attendance.create({
    data: { memberId: member.id, branchId: member.branchId, method: 'GEO_FENCE', latitude, longitude },
  });

  res.status(201).json({ attendance, message: 'Checked in successfully' });
});

// GET /api/v1/attendance/today
router.get('/today', requireRole('BRANCH_MANAGER', 'PERSONAL_TRAINER', 'FLOOR_TRAINER'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const records = await prisma.attendance.findMany({
    where: { branchId: req.user!.branchId!, checkInTime: { gte: today } },
    include: { member: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
    orderBy: { checkInTime: 'desc' },
  });
  res.json(records);
});

// GET /api/v1/attendance/history/:memberId
router.get('/history/:memberId', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const records = await prisma.attendance.findMany({
    where: { memberId: req.params.memberId },
    orderBy: { checkInTime: 'desc' },
    take: 30,
  });
  res.json(records);
});

export default router;

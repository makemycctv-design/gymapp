import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.use(requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'));

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

router.get('/dashboard', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const branchId = (req.query.branchId as string) || req.user!.branchId;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalMembers, activeSubscriptions, todayAttendance, monthlyPayments] = await Promise.all([
    prisma.memberProfile.count({ where: branchId ? { branchId, user: { isActive: true } } : { user: { isActive: true } } }),
    prisma.memberSubscription.count({ where: { ...(branchId ? { branchId } : {}), status: 'ACTIVE', member: { user: { isActive: true } } } }),
    prisma.attendance.count({ where: { ...(branchId ? { branchId } : {}), checkInTime: { gte: today } } }),
    prisma.payment.findMany({ where: { ...(branchId ? { branchId } : {}), status: 'COMPLETED', paidAt: { gte: thirtyDaysAgo } } }),
  ]);

  const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  res.json({ totalMembers, activeSubscriptions, todayAttendance, monthlyRevenue, recentPayments: monthlyPayments.length });
});

export default router;

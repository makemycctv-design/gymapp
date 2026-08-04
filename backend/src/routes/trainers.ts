import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const trainers = await prisma.trainerProfile.findMany({
    where: { user: { branchId: req.user!.branchId!, isActive: true } },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } } },
  });
  res.json(trainers);
});

router.get('/my-clients', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  // Find workout plans created by this trainer
  const plans = await prisma.workoutPlan.findMany({
    where: { trainerId: req.user!.id, isActive: true },
    include: { member: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
  });
  const uniqueMembers = [...new Map(plans.map(p => [p.memberId, p.member])).values()];
  res.json(uniqueMembers);
});

export default router;

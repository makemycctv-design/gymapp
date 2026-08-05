import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

// GET /api/v1/workouts/my - Get member's active workout OR trainer's created workouts
router.get('/my', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);

  // If trainer, show all plans they created
  if (req.user!.role === 'PERSONAL_TRAINER' || req.user!.role === 'FLOOR_TRAINER') {
    const plans = await prisma.workoutPlan.findMany({
      where: { trainerId: req.user!.id },
      include: { exercises: { orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }] }, member: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(plans);
  }

  // If member, show their active plan
  const member = await prisma.memberProfile.findFirst({ where: { userId: req.user!.id } });
  if (!member) return res.status(404).json({ message: 'Member profile not found' });

  const plan = await prisma.workoutPlan.findFirst({
    where: { memberId: member.id, isActive: true },
    include: { exercises: { orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }] }, trainer: { select: { firstName: true, lastName: true } } },
  });
  res.json(plan);
});

// POST /api/v1/workouts - Create workout plan
router.post('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { memberId, name, description, exercises } = req.body;
  const plan = await prisma.workoutPlan.create({
    data: {
      memberId, trainerId: req.user!.id, name, description, isActive: true,
      exercises: { create: exercises || [] },
    },
    include: { exercises: true },
  });
  res.status(201).json(plan);
});

export default router;


// POST /api/v1/workouts/delete/:id
router.post('/delete/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  await prisma.workoutPlan.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Workout deleted' });
});

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

router.get('/my', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);

  // If trainer, show all diet plans they created
  if (req.user!.role === 'PERSONAL_TRAINER' || req.user!.role === 'FLOOR_TRAINER') {
    const plans = await prisma.dietPlan.findMany({
      where: { trainerId: req.user!.id },
      include: { meals: { orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }] }, member: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(plans);
  }

  // If member, show their active plan
  const member = await prisma.memberProfile.findFirst({ where: { userId: req.user!.id } });
  if (!member) return res.status(404).json({ message: 'Member profile not found' });

  const plan = await prisma.dietPlan.findFirst({
    where: { memberId: member.id, isActive: true, isApproved: true },
    include: { meals: { orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }] }, trainer: { select: { firstName: true, lastName: true } } },
  });
  res.json(plan);
});

router.post('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { memberId, name, targetCalories, proteinGrams, carbsGrams, fatGrams, meals } = req.body;
  const plan = await prisma.dietPlan.create({
    data: {
      memberId, trainerId: req.user!.id, name, targetCalories, proteinGrams, carbsGrams, fatGrams, isApproved: false, isActive: true,
      meals: { create: meals || [] },
    },
    include: { meals: true },
  });
  res.status(201).json(plan);
});

export default router;


// POST /api/v1/diets/delete/:id
router.post('/delete/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  await prisma.dietPlan.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Diet plan deleted' });
});

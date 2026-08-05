import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

router.get('/my', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);

  // If trainer, show all measurements they recorded
  if (req.user!.role === 'PERSONAL_TRAINER' || req.user!.role === 'FLOOR_TRAINER') {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { recordedById: req.user!.id },
      include: { member: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { date: 'desc' },
      take: 50,
    });
    return res.json(measurements);
  }

  // If member, show their own measurements
  const member = await prisma.memberProfile.findFirst({ where: { userId: req.user!.id } });
  if (!member) return res.json([]);
  const measurements = await prisma.bodyMeasurement.findMany({ where: { memberId: member.id }, orderBy: { date: 'desc' }, take: 20 });
  res.json(measurements);
});

router.post('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const measurement = await prisma.bodyMeasurement.create({ data: { ...req.body, recordedById: req.user!.id } });
  res.status(201).json(measurement);
});

export default router;

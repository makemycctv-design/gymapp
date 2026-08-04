import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const branches = await prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  res.json(branches);
});

router.post('/', requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const branch = await prisma.branch.create({ data: req.body });
  res.status(201).json(branch);
});

router.get('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const branch = await prisma.branch.findUnique({ where: { id: req.params.id } });
  if (!branch) return res.status(404).json({ message: 'Branch not found' });
  res.json(branch);
});

export default router;

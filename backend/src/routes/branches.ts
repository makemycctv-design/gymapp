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


// POST /api/v1/branches/delete/:id - Deactivate a branch
router.post('/delete/:id', requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  await prisma.branch.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'Branch deleted' });
});


// POST /api/v1/branches/update/:id - Update branch details
router.post('/update/:id', requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { name, address, city, state, zipCode, phone, email, geoFenceRadiusMeters, latitude, longitude } = req.body;
  const branch = await prisma.branch.update({
    where: { id: req.params.id },
    data: { name, address, city, state, zipCode, phone, email, geoFenceRadiusMeters, latitude, longitude },
  });
  res.json(branch);
});

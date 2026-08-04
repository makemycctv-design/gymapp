import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

// GET /api/v1/packages
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const packages = await prisma.membershipPackage.findMany({
    where: { branchId: req.user!.branchId!, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json(packages);
});

// POST /api/v1/packages
router.post('/', requireRole('BRANCH_MANAGER'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const pkg = await prisma.membershipPackage.create({
    data: { ...req.body, branchId: req.user!.branchId! },
  });
  res.status(201).json(pkg);
});

export default router;

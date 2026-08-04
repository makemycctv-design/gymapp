import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

// GET /api/v1/packages
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma(req);

  // Super Admin sees all packages, others see their branch only
  const where = req.user!.branchId
    ? { branchId: req.user!.branchId, isActive: true }
    : { isActive: true };

  const packages = await prisma.membershipPackage.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
  res.json(packages);
});

// POST /api/v1/packages
router.post('/', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { name, description, durationDays, price, includesPersonalTrainer, ptSessionsPerWeek, maxFreezeDays, sortOrder, branchId } = req.body;

  if (!name || !durationDays || !price) {
    return res.status(400).json({ message: 'name, durationDays, and price are required' });
  }

  // Use provided branchId, or user's branchId, or first available branch
  let targetBranchId = branchId || req.user!.branchId;

  if (!targetBranchId) {
    // Super Admin without branchId - use first branch
    const firstBranch = await prisma.branch.findFirst({ where: { isActive: true } });
    if (!firstBranch) return res.status(400).json({ message: 'No branch available. Create a branch first.' });
    targetBranchId = firstBranch.id;
  }

  try {
    const pkg = await prisma.membershipPackage.create({
      data: {
        name,
        description: description || '',
        durationDays: Number(durationDays),
        price: Number(price),
        includesPersonalTrainer: includesPersonalTrainer || false,
        ptSessionsPerWeek: ptSessionsPerWeek ? Number(ptSessionsPerWeek) : null,
        maxFreezeDays: maxFreezeDays ? Number(maxFreezeDays) : 0,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
        branchId: targetBranchId,
      },
    });
    res.status(201).json(pkg);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create package' });
  }
});

export default router;

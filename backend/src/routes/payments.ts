import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

function getPrisma(req: Request): PrismaClient { return req.app.locals.prisma; }

// GET /api/v1/payments/subscriptions - Get all subscriptions with member + package details
router.get('/subscriptions', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const branchId = req.user!.branchId;

  const where = branchId ? { branchId, member: { user: { isActive: true } } } : { member: { user: { isActive: true } } };

  const subscriptions = await prisma.memberSubscription.findMany({
    where,
    include: {
      member: { include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
      package: true,
      branch: { select: { name: true } },
    },
    orderBy: { endDate: 'asc' },
  });
  res.json(subscriptions);
});

export default router;


// POST /api/v1/payments/record-cash - Record a cash payment
router.post('/record-cash', requireRole('BRANCH_MANAGER', 'SUPER_ADMIN'), async (req: Request, res: Response) => {
  const prisma = getPrisma(req);
  const { memberId, subscriptionId, amount, packageName } = req.body;

  const branchId = req.user!.branchId;
  if (!branchId) return res.status(400).json({ message: 'No branch assigned' });

  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const payment = await prisma.payment.create({
    data: {
      memberId,
      subscriptionId: subscriptionId || null,
      branchId,
      amount,
      currency: 'INR',
      method: 'CASH',
      status: 'COMPLETED',
      invoiceNumber,
      approvedById: req.user!.id,
      paidAt: new Date(),
    },
  });

  res.status(201).json({ message: 'Payment recorded', payment });
});

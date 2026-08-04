import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  const adminPass = await bcrypt.hash('Admin@123!', 12);
  const managerPass = await bcrypt.hash('Manager@123!', 12);
  const trainerPass = await bcrypt.hash('Trainer@123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@fitness.nokkoo.in' },
    update: {},
    create: { email: 'admin@fitness.nokkoo.in', phone: '+919999900000', passwordHash: adminPass, firstName: 'Platform', lastName: 'Admin', role: 'SUPER_ADMIN', mustResetPassword: false },
  });

  const branch = await prisma.branch.upsert({
    where: { code: 'BLR-KOR' },
    update: {},
    create: { name: 'FitZone - Koramangala', code: 'BLR-KOR', address: '123 80 Feet Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560034', phone: '+918012345678', email: 'blr@fitness.nokkoo.in', latitude: 12.9352, longitude: 77.6245, geoFenceRadiusMeters: 50 },
  });

  await prisma.user.upsert({
    where: { email: 'manager@fitness.nokkoo.in' },
    update: {},
    create: { email: 'manager@fitness.nokkoo.in', phone: '+919876543210', passwordHash: managerPass, firstName: 'Rahul', lastName: 'Sharma', role: 'BRANCH_MANAGER', branchId: branch.id, mustResetPassword: false },
  });

  const pt = await prisma.user.upsert({
    where: { email: 'trainer@fitness.nokkoo.in' },
    update: {},
    create: { email: 'trainer@fitness.nokkoo.in', phone: '+919876543211', passwordHash: trainerPass, firstName: 'Arjun', lastName: 'Patel', role: 'PERSONAL_TRAINER', branchId: branch.id, mustResetPassword: false },
  });

  await prisma.trainerProfile.upsert({
    where: { userId: pt.id },
    update: {},
    create: { userId: pt.id, specializations: ['strength', 'fat_loss'], certifications: ['ACE-CPT'], bio: 'Certified trainer', maxClients: 12 },
  });

  await prisma.membershipPackage.createMany({
    data: [
      { branchId: branch.id, name: 'Basic - 1 Month', description: 'Gym floor access + floor trainer', durationDays: 30, price: 1500, sortOrder: 1 },
      { branchId: branch.id, name: 'Silver - 3 Months', description: 'Full access + 5 freeze days', durationDays: 90, price: 3999, maxFreezeDays: 5, sortOrder: 2 },
      { branchId: branch.id, name: 'Gold - 6 Months', description: 'Full access + diet plan', durationDays: 180, price: 6999, maxFreezeDays: 10, sortOrder: 3 },
      { branchId: branch.id, name: 'Platinum 3M + PT', description: 'Personal trainer 3x/week', durationDays: 90, price: 8999, includesPersonalTrainer: true, ptSessionsPerWeek: 3, sortOrder: 4 },
      { branchId: branch.id, name: 'Diamond 12M + PT', description: 'Annual plan + PT 5x/week', durationDays: 365, price: 29999, includesPersonalTrainer: true, ptSessionsPerWeek: 5, sortOrder: 5 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeded! Logins: admin/manager/trainer @fitness.nokkoo.in / Admin@123! or Manager@123! or Trainer@123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());

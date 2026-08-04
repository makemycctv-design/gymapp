import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPass = await bcrypt.hash('Admin@123!', 12);
  const managerPass = await bcrypt.hash('Manager@123!', 12);
  const trainerPass = await bcrypt.hash('Trainer@123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fitness.nokkoo.in' },
    update: {},
    create: {
      email: 'admin@fitness.nokkoo.in',
      phone: '+919999900000',
      passwordHash: adminPass,
      firstName: 'Platform',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      mustResetPassword: false,
    },
  });

  const branch = await prisma.branch.upsert({
    where: { code: 'BLR-KOR' },
    update: {},
    create: {
      name: 'FitZone - Koramangala',
      code: 'BLR-KOR',
      address: '123 80 Feet Road, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560034',
      phone: '+918012345678',
      email: 'koramangala@fitness.nokkoo.in',
      latitude: 12.9352,
      longitude: 77.6245,
      geoFenceRadiusMeters: 50,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@fitness.nokkoo.in' },
    update: {},
    create: {
      email: 'manager@fitness.nokkoo.in',
      phone: '+919876543210',
      passwordHash: managerPass,
      firstName: 'Rahul',
      lastName: 'Sharma',
      role: UserRole.BRANCH_MANAGER,
      branchId: branch.id,
      mustResetPassword: true,
    },
  });

  const pt = await prisma.user.upsert({
    where: { email: 'trainer@fitness.nokkoo.in' },
    update: {},
    create: {
      email: 'trainer@fitness.nokkoo.in',
      phone: '+919876543211',
      passwordHash: trainerPass,
      firstName: 'Arjun',
      lastName: 'Patel',
      role: UserRole.PERSONAL_TRAINER,
      branchId: branch.id,
      mustResetPassword: true,
    },
  });

  await prisma.trainerProfile.upsert({
    where: { userId: pt.id },
    update: {},
    create: {
      userId: pt.id,
      specializations: ['strength', 'fat_loss', 'hypertrophy'],
      certifications: ['ACE-CPT', 'ISSA-SFN'],
      bio: 'Certified strength coach with 5+ years experience.',
      maxClients: 12,
    },
  });

  await prisma.membershipPackage.createMany({
    data: [
      { branchId: branch.id, name: 'Basic - 1 Month', description: 'Gym floor access with floor trainer.', durationDays: 30, price: 1500, sortOrder: 1 },
      { branchId: branch.id, name: 'Silver - 3 Months', description: 'Full access + 5 freeze days.', durationDays: 90, price: 3999, maxFreezeDays: 5, sortOrder: 2 },
      { branchId: branch.id, name: 'Gold - 6 Months', description: 'Full access + diet plan + 10 freeze days.', durationDays: 180, price: 6999, maxFreezeDays: 10, sortOrder: 3 },
      { branchId: branch.id, name: 'Platinum - 3M + PT', description: 'Personal trainer 3x/week + diet.', durationDays: 90, price: 8999, includesPersonalTrainer: true, ptSessionsPerWeek: 3, maxFreezeDays: 7, sortOrder: 4 },
      { branchId: branch.id, name: 'Diamond - 12M + PT', description: 'Annual PT plan 5x/week + full nutrition.', durationDays: 365, price: 29999, includesPersonalTrainer: true, ptSessionsPerWeek: 5, maxFreezeDays: 30, sortOrder: 5 },
    ],
    skipDuplicates: true,
  });

  console.log('');
  console.log('=================================');
  console.log('  DATABASE SEEDED SUCCESSFULLY!');
  console.log('=================================');
  console.log('');
  console.log('Login Credentials:');
  console.log('  Admin:   admin@fitness.nokkoo.in / Admin@123!');
  console.log('  Manager: manager@fitness.nokkoo.in / Manager@123!');
  console.log('  Trainer: trainer@fitness.nokkoo.in / Trainer@123!');
  console.log('');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

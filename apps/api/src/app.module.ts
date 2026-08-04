import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { MemberModule } from './modules/member/member.module';
import { TrainerModule } from './modules/trainer/trainer.module';
import { PackageModule } from './modules/package/package.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    BranchModule,
    MemberModule,
    TrainerModule,
    PackageModule,
    AttendanceModule,
    HealthModule,
  ],
})
export class AppModule {}

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async generateMemberId(branchCode: string): Promise<string> {
    const count = await this.memberProfile.count({
      where: { memberId: { startsWith: `GYM-${branchCode}` } },
    });
    return `GYM-${branchCode}-${String(count + 1).padStart(4, '0')}`;
  }
}

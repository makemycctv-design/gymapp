import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('trainers')
@UseGuards(AuthGuard('jwt'))
export class TrainerController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.prisma.trainerProfile.findMany({
      where: { user: { branchId: req.user.branchId, isActive: true } },
      include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
    });
  }

  @Get('my-clients')
  async myClients(@Req() req: any) {
    const profile = await this.prisma.trainerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return [];
    return this.prisma.trainerAssignment.findMany({
      where: { trainerId: profile.id, isActive: true },
      include: { member: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
    });
  }
}

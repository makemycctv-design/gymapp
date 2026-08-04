import { Controller, Post, Get, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(private prisma: PrismaService) {}

  @Post('front-desk')
  async frontDesk(@Body() body: { phoneOrMemberId: string }, @Req() req: any) {
    const member = await this.prisma.memberProfile.findFirst({
      where: {
        branchId: req.user.branchId,
        OR: [{ memberId: body.phoneOrMemberId }, { user: { phone: body.phoneOrMemberId } }],
      },
      include: { user: { select: { firstName: true, lastName: true, isActive: true } } },
    });
    if (!member) throw new BadRequestException('Member not found');
    if (!member.user.isActive) throw new BadRequestException('Member account deactivated');

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await this.prisma.attendance.count({ where: { memberId: member.id, checkInTime: { gte: today } } });
    if (existing > 0) throw new BadRequestException('Already checked in today');

    const attendance = await this.prisma.attendance.create({
      data: { memberId: member.id, branchId: req.user.branchId, method: 'FRONT_DESK_LOOKUP', verifiedById: req.user.id },
    });
    return { attendance, member: { memberId: member.memberId, name: `${member.user.firstName} ${member.user.lastName}` } };
  }

  @Post('geo-fence')
  async geoFence(@Body() body: { latitude: number; longitude: number }, @Req() req: any) {
    const member = await this.prisma.memberProfile.findFirst({
      where: { userId: req.user.id },
      include: { branch: true },
    });
    if (!member) throw new BadRequestException('Member profile not found');

    const R = 6371000;
    const dLat = (member.branch.latitude - body.latitude) * Math.PI / 180;
    const dLon = (member.branch.longitude - body.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(body.latitude*Math.PI/180) * Math.cos(member.branch.latitude*Math.PI/180) * Math.sin(dLon/2)**2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    if (distance > member.branch.geoFenceRadiusMeters) {
      throw new BadRequestException(`You are ${Math.round(distance)}m away. Must be within ${member.branch.geoFenceRadiusMeters}m.`);
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await this.prisma.attendance.count({ where: { memberId: member.id, checkInTime: { gte: today } } });
    if (existing > 0) throw new BadRequestException('Already checked in today');

    return this.prisma.attendance.create({
      data: { memberId: member.id, branchId: member.branchId, method: 'GEO_FENCE', latitude: body.latitude, longitude: body.longitude },
    });
  }

  @Get('today')
  async today(@Req() req: any) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return this.prisma.attendance.findMany({
      where: { branchId: req.user.branchId, checkInTime: { gte: today } },
      include: { member: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
      orderBy: { checkInTime: 'desc' },
    });
  }
}

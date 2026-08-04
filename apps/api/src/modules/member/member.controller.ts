import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Controller('members')
@UseGuards(AuthGuard('jwt'))
export class MemberController {
  constructor(private prisma: PrismaService) {}
  @Get()
  async findAll(@Req() req: any) {
    return this.prisma.memberProfile.findMany({ where: { branchId: req.user.branchId }, include: { user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true, isActive: true } } } });
  }
  @Get('search')
  async search(@Query('q') q: string, @Req() req: any) {
    return this.prisma.memberProfile.findMany({ where: { branchId: req.user.branchId, OR: [{ memberId: { contains: q, mode: 'insensitive' } }, { user: { phone: { contains: q } } }, { user: { firstName: { contains: q, mode: 'insensitive' } } }] }, include: { user: { select: { firstName: true, lastName: true, phone: true } } }, take: 10 });
  }
  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let tempPass = ''; for (let i = 0; i < 10; i++) tempPass += chars[Math.floor(Math.random() * chars.length)];
    const hash = await bcrypt.hash(tempPass, 12);
    const branch = await this.prisma.branch.findUnique({ where: { id: req.user.branchId }, select: { code: true } });
    const memberId = await this.prisma.generateMemberId(branch!.code);
    const user = await this.prisma.user.create({ data: { email: body.email, phone: body.phone, passwordHash: hash, firstName: body.firstName, lastName: body.lastName, role: 'MEMBER', branchId: req.user.branchId, mustResetPassword: true } });
    await this.prisma.memberProfile.create({ data: { userId: user.id, branchId: req.user.branchId, memberId, dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null, gender: body.gender || null, trainerTier: body.trainerTier || 'FLOOR' } });
    return { memberId, credentials: { email: body.email, temporaryPassword: tempPass } };
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.memberProfile.findUnique({ where: { id }, include: { user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true } }, subscriptions: { include: { package: true } } } });
  }
}

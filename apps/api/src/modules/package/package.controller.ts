import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('packages')
@UseGuards(AuthGuard('jwt'))
export class PackageController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.prisma.membershipPackage.findMany({
      where: { branchId: req.user.branchId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Post()
  create(@Body() data: any, @Req() req: any) {
    return this.prisma.membershipPackage.create({ data: { ...data, branchId: req.user.branchId } });
  }
}

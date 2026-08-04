import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('branches')
@UseGuards(AuthGuard('jwt'))
export class BranchController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() { return this.prisma.branch.findMany({ where: { isActive: true } }); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.prisma.branch.findUnique({ where: { id } }); }

  @Post()
  create(@Body() data: any) { return this.prisma.branch.create({ data }); }
}

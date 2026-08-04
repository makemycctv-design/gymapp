import { Module } from '@nestjs/common';
import { TrainerController } from './trainer.controller';

@Module({ controllers: [TrainerController] })
export class TrainerModule {}

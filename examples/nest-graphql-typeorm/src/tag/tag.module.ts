import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from './tag.entity';
import { TagResolver } from './tag.resolver';
import { TagService } from './tag.service';

@Module({
  providers: [TagResolver, TagService],
  imports: [TypeOrmModule.forFeature([TagEntity])],
})
export class TagModule {}

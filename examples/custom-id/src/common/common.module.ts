import { Module } from '@nestjs/common';
import { CustomIDScalar } from './custom-id.scalar';

@Module({
  providers: [CustomIDScalar],
})
export class CommonModule {}

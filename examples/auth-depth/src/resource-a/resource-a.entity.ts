import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResourceBEntity } from '../resource-b/resource-b.entity';

@Entity({ name: 'resource_a' })
export class ResourceAEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => ResourceBEntity, (b) => b.resourceA)
  resourceBs!: ResourceBEntity[];
}

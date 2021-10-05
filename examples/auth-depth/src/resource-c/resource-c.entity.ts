import { Column, Entity, JoinColumn, ManyToOne, ObjectType, PrimaryGeneratedColumn } from 'typeorm';
import { ResourceBEntity } from '../resource-b/resource-b.entity';

@Entity({ name: 'resource_c' })
export class ResourceCEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, name: 'resource_b_id' })
  resourceBId!: string;

  @ManyToOne((): ObjectType<ResourceBEntity> => ResourceBEntity, (b) => b.resourceCs, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'resource_b_id' })
  resourceB!: ResourceBEntity;
}

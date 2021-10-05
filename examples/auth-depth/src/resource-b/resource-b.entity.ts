import { Column, Entity, JoinColumn, ManyToOne, ObjectType, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResourceAEntity } from '../resource-a/resource-a.entity';
import { ResourceCEntity } from '../resource-c/resource-c.entity';

@Entity({ name: 'resource_b' })
export class ResourceBEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, name: 'resource_a_id' })
  resourceAId!: string;

  @ManyToOne((): ObjectType<ResourceAEntity> => ResourceAEntity, (a) => a.resourceBs, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'resource_a_id' })
  resourceA!: ResourceAEntity;

  @OneToMany(() => ResourceCEntity, (c) => c.resourceB)
  resourceCs!: ResourceCEntity[];
}

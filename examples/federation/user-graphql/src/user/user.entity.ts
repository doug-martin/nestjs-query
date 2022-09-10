import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  email!: string

  @CreateDateColumn()
  created!: Date

  @UpdateDateColumn()
  updated!: Date
}

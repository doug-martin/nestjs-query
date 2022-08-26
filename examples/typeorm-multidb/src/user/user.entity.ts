import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  firstName!: string

  @Column()
  lastName!: string

  @Column()
  emailAddress!: string

  @CreateDateColumn()
  created!: Date

  @UpdateDateColumn()
  updated!: Date
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Demo {
  @PrimaryGeneratedColumn({ comment: 'id column' })
  readonly id: number;

  @Column({ length: 20, comment: 'name column' })
  readonly name: string;

  @Column({ comment: 'description column' })
  readonly description: string;
}

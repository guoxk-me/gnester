import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DemoAudit {
  @PrimaryGeneratedColumn({ comment: 'Audit row id 审计记录 ID' })
  readonly id: number;

  @Column({
    comment: 'Demo row id from the primary database 主库 demo 记录 ID',
  })
  readonly demoId: number;

  @Column({ length: 50, comment: 'Audited demo action 被审计的 demo 操作' })
  readonly action: string;
}

import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// import { Exclude, Transform } from 'class-transformer';
@Entity()
export class Demo {
  @PrimaryGeneratedColumn({ comment: 'id column' })
  readonly id: number;

  @Column({ length: 20, comment: 'name column' })
  readonly name: string;

  @Expose()
  //use Expose to expose property, similar to getter
  //使用Expose 暴露属性 类似getter
  get nameWithId(): string {
    return `${this.name}#${this.id}`;
  }

  // @Transform(({ value }) => value.toUpperCase())
  // use Transform to transform property value during serialization
  // 使用Transform 在序列化过程中转换属性值

  // @Exclude()
  // use Exclude to exclude property from serialization
  // 使用Exclude 从序列化中排除属性
  @Column({ comment: 'description column' })
  readonly description: string;
}

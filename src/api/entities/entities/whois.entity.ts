import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export default class WhoisEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  site_id: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  ts: string;

  @Column({
    type: 'bytea',
    nullable: false,
  })
  raw: Buffer;
}

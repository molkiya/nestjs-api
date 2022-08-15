import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WhoisEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  site_id: number;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  ts: string;

  @Column({
    type: 'bytea',
    nullable: false,
  })
  raw: Buffer;
}

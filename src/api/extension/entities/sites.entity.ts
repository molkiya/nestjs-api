import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SitesEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  id: number;

  @Column({
    type: 'text',
    unique: true,
  })
  fqdn: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  created_by: number;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    nullable: false,
    type: 'text',
  })
  status: string;
}

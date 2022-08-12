import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SitesEntity } from './sites.entity';

@Entity()
export class WhoisEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  site_id: number;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  ts: string;

  @Column({
    type: 'bytea',
    nullable: true,
  })
  raw: Buffer;

  @ManyToOne(() => SitesEntity, (site) => site.whois)
  @JoinColumn({ name: 'site_id' })
  site: SitesEntity;
}

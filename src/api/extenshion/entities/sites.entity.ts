import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WhoisEntity } from './whois.entity';

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
    nullable: true,
    // nullable: false,
  })
  created_by: string;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @OneToMany(() => WhoisEntity, (whoisEntity) => whoisEntity.site)
  whois: WhoisEntity[];
}

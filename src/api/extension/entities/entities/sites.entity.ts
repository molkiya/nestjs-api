import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export default class SitesEntity {
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

  @CreateDateColumn({type: 'timestamp', nullable: false})
  created_at: Date;

  @Column({
    nullable: false,
    type: 'text',
  })
  status: string;
}

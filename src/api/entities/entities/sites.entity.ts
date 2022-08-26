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
    type: 'text',
    nullable: false,
  })
  created_by: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  created_at: Date;

  @Column({
    type: 'int',
    nullable: true,
  })
  assigned_by: number;

  @Column({
    nullable: false,
    type: 'text',
  })
  status: string;

  @Column({
    nullable: false,
    type: 'text',
  })
  title: string;
}

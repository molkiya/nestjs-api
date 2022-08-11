import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Host {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  //TODO Не знаю что еще тут)
}

import { Repository, getRepository } from 'typeorm';
import { Specification } from '../../entities/Specification';
import {
  ICreateSpecificationDTO,
  ISpecificationRepository,
} from '../ISpecificationsRepository';

class SpecificationRepository implements ISpecificationRepository {
  private repository: Repository<Specification>;

  constructor() {
    this.repository = getRepository(Specification);
  }

  async create({ name, description }: ICreateSpecificationDTO): Promise<void> {
    const specificiation = this.repository.create({
      description,
      name,
    });

    await this.repository.save(specificiation);
  }

  async findByName(name: string): Promise<Specification> {
    const specification = this.repository.findOne({
      name,
    });

    return specification;
  }
}

export { SpecificationRepository };

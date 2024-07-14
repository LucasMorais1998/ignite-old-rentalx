import { faker } from '@faker-js/faker';
import { Specification } from '@modules/cars/infra/typeorm/entities/Specification';

type PartialSpecification = Partial<Specification>;

export function makeSpecification(
  override: PartialSpecification = {}
): Partial<Specification> {
  const defaultSpecification: Partial<Specification> = {
    id: faker.string.uuid(),
    name: faker.vehicle.type(),
    created_at: faker.date.anytime(),
  };

  return {
    ...defaultSpecification,
    ...override,
  };
}

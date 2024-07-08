import { faker } from '@faker-js/faker';
import { Category } from '@modules/cars/infra/typeorm/entities/Category';

type PartialCategory = Partial<Category>;

export function makeCategory(
  override: PartialCategory = {}
): Partial<Category> {
  const defaultCategory: Partial<Category> = {
    id: faker.string.uuid(),
    name: faker.vehicle.type(),
    description: faker.lorem.sentence(3),
    created_at: faker.date.past(),
  };

  return {
    ...defaultCategory,
    ...override,
  };
}

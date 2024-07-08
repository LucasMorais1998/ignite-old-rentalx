import { faker } from '@faker-js/faker';
import { Car } from '@modules/cars/infra/typeorm/entities/Car';

type PartialCar = Partial<Car>;

export function makeCar(override: PartialCar = {}): Partial<Car> {
  const defaultCar: Partial<Car> = {
    id: faker.string.uuid(),
    available: true,
    name: faker.vehicle.vehicle(),
    description: faker.lorem.sentence(2),
    daily_rate: faker.number.int(300),
    license_plate: faker.vehicle.vrm(),
    fine_amount: faker.number.int(500),
    brand: faker.vehicle.manufacturer(),
    category_id: faker.string.uuid(),
    created_at: faker.date.anytime(),
  };

  return {
    ...defaultCar,
    ...override,
  };
}

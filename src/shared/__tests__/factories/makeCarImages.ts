import { faker } from '@faker-js/faker';
import { CarImage } from '@modules/cars/infra/typeorm/entities/CarImage';

type PartialCarImages = Partial<CarImage>;

export function makeCarImages(
  override: PartialCarImages = {}
): Partial<CarImage> {
  const defaultCarImages: Partial<CarImage> = {
    id: faker.string.uuid(),
    car_id: faker.string.uuid(),
    image_name: faker.vehicle.vehicle(),
    created_at: faker.date.anytime(),
  };

  return {
    ...defaultCarImages,
    ...override,
  };
}

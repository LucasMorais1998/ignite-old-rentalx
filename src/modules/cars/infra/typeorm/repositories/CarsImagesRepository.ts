import { ICarsImagesRepository } from '@modules/cars/repositories/ICarsImagesRepository';
import { getRepository, Repository } from 'typeorm';
import { CarImage } from '../entities/CarImage';

class CarsImageRepository implements ICarsImagesRepository {
  private repository: Repository<CarImage>;

  constructor() {
    this.repository = getRepository(CarImage);
  }

  async create(car_id: string, image_name: string): Promise<CarImage> {
    const carImage = this.repository.create({
      car_id,
      image_name,
    });

    await this.repository.save(carImage);

    return carImage;
  }

  async delete(car_id: string, images_name: string[]): Promise<void> {
    for (const image of images_name) {
      await this.repository.delete({ car_id, image_name: image });
    }
  }
}

export { CarsImageRepository };

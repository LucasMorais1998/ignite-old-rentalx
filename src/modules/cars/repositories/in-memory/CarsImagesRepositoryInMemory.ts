import { CarImage } from '@modules/cars/infra/typeorm/entities/CarImage';
import { ICarsImagesRepository } from '../ICarsImagesRepository';

class CarsImagesRepositoryInMemory implements ICarsImagesRepository {
  carsImages: CarImage[] = [];

  async create(car_id: string, image_name: string): Promise<CarImage> {
    const carImages = new CarImage();

    Object.assign(carImages, {
      car_id,
      image_name,
    });

    this.carsImages.push(carImages);

    return carImages;
  }
  delete(car_id: string, images_name: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export { CarsImagesRepositoryInMemory };

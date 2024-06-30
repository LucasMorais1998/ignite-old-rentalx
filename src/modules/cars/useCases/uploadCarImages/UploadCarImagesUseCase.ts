import { ICarsImagesRepository } from '@modules/cars/repositories/ICarsImagesRepository';
import { inject, injectable } from 'tsyringe';

interface IRequest {
  car_id: string;
  images_name: string[];
}

@injectable()
class UploadCarImagesUseCase {
  constructor(
    @inject('CarsImagesRepository')
    private carsImagesRepository: ICarsImagesRepository
  ) {}

  async execute({ car_id, images_name }: IRequest): Promise<void> {
    const uploadPromises = images_name.map((image) =>
      this.carsImagesRepository.create(car_id, image)
    );

    await Promise.all(uploadPromises);
  }
}

export { UploadCarImagesUseCase };

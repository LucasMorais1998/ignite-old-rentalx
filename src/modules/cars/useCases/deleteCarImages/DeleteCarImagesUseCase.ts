import { ICarsImagesRepository } from '@modules/cars/repositories/ICarsImagesRepository';
import { inject, injectable } from 'tsyringe';

interface IRequest {
  car_id: string;
  images_name: string[];
}

@injectable()
class DeleteCarImagesUseCase {
  constructor(
    @inject('CarsImagesRepository')
    private carsImagesRepository: ICarsImagesRepository
  ) {}

  async execute({ car_id, images_name }: IRequest): Promise<void> {
    await this.carsImagesRepository.delete(car_id, images_name);
  }
}

export { DeleteCarImagesUseCase };

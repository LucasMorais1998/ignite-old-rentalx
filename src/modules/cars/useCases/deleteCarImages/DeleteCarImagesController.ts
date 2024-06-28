import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DeleteCarImagesUseCase } from './DeleteCarImagesUseCase';

class DeleteCarImagesController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { carId: car_id, imagesNames: images_name } = request.body;

    const deleteCarImageUseCase = container.resolve(DeleteCarImagesUseCase);

    await deleteCarImageUseCase.execute({ car_id, images_name });

    return response.status(200).send();
  }
}

export { DeleteCarImagesController };

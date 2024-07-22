import { CarsImagesRepositoryInMemory } from '@modules/cars/repositories/in-memory/CarsImagesRepositoryInMemory';
import { makeCar } from '@shared/__tests__/factories/makeCar';
import { makeCarImages } from '@shared/__tests__/factories/makeCarImages';
import { UploadCarImagesUseCase } from './UploadCarImagesUseCase';

let uploadCarImagesUseCase: UploadCarImagesUseCase;
let carsImagesRepositoryInMemory: CarsImagesRepositoryInMemory;

describe('Upload Car Images Use Case', () => {
  beforeEach(() => {
    carsImagesRepositoryInMemory = new CarsImagesRepositoryInMemory();

    carsImagesRepositoryInMemory = ({
      create: jest.fn(),
    } as unknown) as CarsImagesRepositoryInMemory;

    uploadCarImagesUseCase = new UploadCarImagesUseCase(
      carsImagesRepositoryInMemory
    );
  });

  it('should be able to upload multiple car images', async () => {
    const newCarImages = ['car-image-test-1.jpg', 'car-image-test-1.jpg'];

    const newUploadedCarImages = [
      makeCarImages({
        image_name: newCarImages[0],
      }),
      makeCarImages({
        image_name: newCarImages[1],
      }),
    ];

    const mockCar = makeCar();

    (<jest.Mock>carsImagesRepositoryInMemory.create).mockResolvedValue(
      newUploadedCarImages
    );

    await uploadCarImagesUseCase.execute({
      car_id: mockCar.id,
      images_name: newCarImages,
    });

    expect(carsImagesRepositoryInMemory.create).toHaveBeenCalledTimes(
      newCarImages.length
    );
    newCarImages.forEach((image, index) => {
      expect(carsImagesRepositoryInMemory.create).toHaveBeenNthCalledWith(
        index + 1,
        mockCar.id,
        image
      );
    });
  });
});

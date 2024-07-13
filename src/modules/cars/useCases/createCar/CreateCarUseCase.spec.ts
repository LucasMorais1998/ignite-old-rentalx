import { CarsRepositoryInMemory } from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import { makeCar } from '@shared/__tests__/factories/makeCar';
import { AppError } from '@shared/errors/AppError';
import { CreateCarUseCase } from './CreateCarUseCase';

let createCarUseCase: CreateCarUseCase;
let carsRepositoryInMemory: CarsRepositoryInMemory;

describe('Create Car', () => {
  beforeEach(() => {
    carsRepositoryInMemory = new CarsRepositoryInMemory();

    carsRepositoryInMemory = ({
      findByLicensePlate: jest.fn(),
      create: jest.fn(),
    } as unknown) as CarsRepositoryInMemory;

    createCarUseCase = new CreateCarUseCase(carsRepositoryInMemory);
  });

  it('should be able to create a new car', async () => {
    const newCarData = {
      name: 'Test Car',
      description: 'A test car',
      daily_rate: 100,
      license_plate: 'TEST-1234',
      fine_amount: 60,
      brand: 'Test Brand',
      category_id: 'test-category-id',
    };

    const expectedNewCar = makeCar(newCarData);

    (<jest.Mock>carsRepositoryInMemory.create).mockResolvedValue(
      expectedNewCar
    );

    const result = await createCarUseCase.execute(newCarData);

    expect(carsRepositoryInMemory.create).toHaveBeenCalledTimes(1);
    expect(carsRepositoryInMemory.create).toHaveBeenCalledWith(newCarData);
    expect(result).toEqual(expectedNewCar);
  });

  it('should create a new car with available true by default', async () => {
    const newCarData = {
      name: 'Test Car',
      description: 'A test car',
      daily_rate: 100,
      license_plate: 'DEF-5678',
      fine_amount: 60,
      brand: 'Test Brand',
      category_id: 'test-category-id',
    };

    const expectedNewCar = makeCar(newCarData);

    (<jest.Mock>carsRepositoryInMemory.create).mockResolvedValue(
      expectedNewCar
    );

    const result = await createCarUseCase.execute(newCarData);

    expect(carsRepositoryInMemory.create).toHaveBeenCalledTimes(1);
    expect(carsRepositoryInMemory.create).toHaveBeenCalledWith(newCarData);
    expect(result.available).toEqual(true);
    expect(result).toEqual(expectedNewCar);
  });

  it('should not be able to create a car with existing license plate', () => {
    expect(async () => {
      const newCarData = {
        name: 'Test Car',
        description: 'A test car',
        daily_rate: 100,
        license_plate: 'ABC-1234',
        fine_amount: 60,
        brand: 'Test Brand',
        category_id: 'test-category-id',
      };

      const existingCar = makeCar(newCarData);

      (<jest.Mock>carsRepositoryInMemory.findByLicensePlate).mockResolvedValue(
        existingCar
      );

      await createCarUseCase.execute(newCarData);
    }).rejects.toBeInstanceOf(AppError);
  });
});

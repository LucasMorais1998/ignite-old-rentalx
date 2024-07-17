import { CarsRepositoryInMemory } from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import { SpecificationsRepositoryInMemory } from '@modules/cars/repositories/in-memory/SpecificationsRepositoryInMemory';
import { makeCar } from '@shared/__tests__/factories/makeCar';
import { makeSpecification } from '@shared/__tests__/factories/makeSpecification';
import { AppError } from '@shared/errors/AppError';
import { CreateCarSpecificationUseCase } from './CreateCarSpecificationUseCase';

let createCarSpecificationUseCase: CreateCarSpecificationUseCase;
let carsRepositoryInMemory: CarsRepositoryInMemory;
let specificationsRepositoryInMemory: SpecificationsRepositoryInMemory;

describe('Create Car Specification Use Case', () => {
  beforeEach(() => {
    carsRepositoryInMemory = new CarsRepositoryInMemory();

    carsRepositoryInMemory = ({
      create: jest.fn(),
      findById: jest.fn(),
    } as unknown) as CarsRepositoryInMemory;

    specificationsRepositoryInMemory = new SpecificationsRepositoryInMemory();

    specificationsRepositoryInMemory = ({
      findByIds: jest.fn(),
    } as unknown) as SpecificationsRepositoryInMemory;

    createCarSpecificationUseCase = new CreateCarSpecificationUseCase(
      carsRepositoryInMemory,
      specificationsRepositoryInMemory
    );
  });

  it('should be able to add a new specification to a car', async () => {
    const mockCar = makeCar();
    (<jest.Mock>carsRepositoryInMemory.findById).mockResolvedValue(mockCar);

    const mockSpecification = makeSpecification();
    (<jest.Mock>specificationsRepositoryInMemory.findByIds).mockResolvedValue([
      mockSpecification,
    ]);

    const result = await createCarSpecificationUseCase.execute({
      car_id: mockCar.id,
      specifications_id: [mockSpecification.id],
    });

    console.log(result);

    expect(result).toHaveProperty('specifications');
    expect(result.specifications).toHaveLength(1);
  });

  it('should not be able to add a new specification to a non-existent car', async () => {
    expect(async () => {
      const invalidCarId = 'invalid-car-id';

      (<jest.Mock>carsRepositoryInMemory.findById).mockResolvedValue(null);

      const mockSpecification = makeSpecification();
      (<jest.Mock>(
        specificationsRepositoryInMemory.findByIds
      )).mockResolvedValue([mockSpecification]);

      await createCarSpecificationUseCase.execute({
        car_id: invalidCarId,
        specifications_id: [mockSpecification.id],
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});

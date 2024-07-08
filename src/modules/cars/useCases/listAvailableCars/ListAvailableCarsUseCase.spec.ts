import { CarsRepositoryInMemory } from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import { makeCar } from '@shared/__tests__/factories/makeCar';
import { ListAvailableCarsUseCase } from './ListAvailableCarsUseCase';

let listAvailableCarsUseCase: ListAvailableCarsUseCase;
let carsRepositoryInMemory: CarsRepositoryInMemory;

describe('List Available Cars', () => {
  beforeEach(() => {
    carsRepositoryInMemory = new CarsRepositoryInMemory();

    carsRepositoryInMemory = ({
      findAvailable: jest.fn(),
    } as unknown) as CarsRepositoryInMemory;

    listAvailableCarsUseCase = new ListAvailableCarsUseCase(
      carsRepositoryInMemory
    );
  });

  it('should be able to list all available cars', async () => {
    const expectedCarsList = [makeCar(), makeCar()];

    (<jest.Mock>carsRepositoryInMemory.findAvailable).mockResolvedValue(
      expectedCarsList
    );

    const result = await listAvailableCarsUseCase.execute({});

    expect(carsRepositoryInMemory.findAvailable).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined
    );
    expect(result).toEqual(expectedCarsList);
  });

  it('should be able to list all available cars by category', async () => {
    const category_id = 'Category id Test';
    const expectedCarsList = [makeCar({ category_id: category_id })];

    (<jest.Mock>carsRepositoryInMemory.findAvailable).mockResolvedValue(
      expectedCarsList
    );

    const result = await listAvailableCarsUseCase.execute({ category_id });

    expect(carsRepositoryInMemory.findAvailable).toHaveBeenCalledWith(
      category_id,
      undefined,
      undefined
    );
    expect(result).toEqual(expectedCarsList);
  });

  it('should be able to list all available cars by brand', async () => {
    const brand = 'Brand Test A';
    const expectedCarsList = [makeCar({ brand: brand })];

    (<jest.Mock>carsRepositoryInMemory.findAvailable).mockResolvedValue(
      expectedCarsList
    );

    const result = await listAvailableCarsUseCase.execute({ brand });

    expect(carsRepositoryInMemory.findAvailable).toHaveBeenCalledWith(
      undefined,
      brand,
      undefined
    );
    expect(result).toEqual(expectedCarsList);
  });

  it('should be able to list all available cars by name', async () => {
    const name = 'Car Test';
    const expectedCarsList = [makeCar({ name: name })];

    (<jest.Mock>carsRepositoryInMemory.findAvailable).mockResolvedValue(
      expectedCarsList
    );

    const result = await listAvailableCarsUseCase.execute({ name });

    expect(carsRepositoryInMemory.findAvailable).toHaveBeenCalledWith(
      undefined,
      undefined,
      name
    );
    expect(result).toEqual(expectedCarsList);
  });

  it('should return an empty list if no cars are available', async () => {
    (<jest.Mock>carsRepositoryInMemory.findAvailable).mockResolvedValue([]);

    const result = await listAvailableCarsUseCase.execute({});

    expect(carsRepositoryInMemory.findAvailable).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined
    );
    expect(result).toEqual([]);
  });
});

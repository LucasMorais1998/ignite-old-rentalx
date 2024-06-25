import { CarsRepositoryInMemory } from '@modules/cars/repositories/in-memory/CarsRepositoryInMemory';
import { ListAvailableCarsUseCase } from './ListAvailableCarsUseCase';

let listAvailableCarsUseCase: ListAvailableCarsUseCase;
let carsRepositoryInMemory: CarsRepositoryInMemory;

describe('List Available Cars', () => {
  beforeEach(() => {
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    listAvailableCarsUseCase = new ListAvailableCarsUseCase(carsRepositoryInMemory);
  });

  it('should be able to list all available cars', async () => {
    const car = await carsRepositoryInMemory.create({
      name: 'Car_1',
      description: 'Car_description_1',
      daily_rate: 110.0,
      license_plate: 'license_plate_1',
      fine_amount: 10,
      brand: 'Car_brand_1',
      category_id: 'category_id_1',
    });

    const cars = await listAvailableCarsUseCase.execute({});

    expect(cars).toEqual([car]);
  });

  it('should be able to list all available cars by category', async () => {
    const car = await carsRepositoryInMemory.create({
      name: 'Car_2',
      description: 'Car_description_2',
      daily_rate: 220.0,
      license_plate: 'license_plate_2',
      fine_amount: 20,
      brand: 'Car_brand_2',
      category_id: 'category_id_2',
    });

    const cars = await listAvailableCarsUseCase.execute({
      category_id: 'category_id_2',
    });

    expect(cars).toEqual([car]);
  });

  it('should be able to list all available cars by brand', async () => {
    const car = await carsRepositoryInMemory.create({
      name: 'Car_3',
      description: 'Car_description_3',
      daily_rate: 330.0,
      license_plate: 'license_plate_3',
      fine_amount: 30,
      brand: 'Car_brand_3',
      category_id: 'category_id_3',
    });

    const cars = await listAvailableCarsUseCase.execute({
      brand: 'Car_brand_3',
    });

    expect(cars).toEqual([car]);
  });

  it('should be able to list all available cars by name', async () => {
    const car = await carsRepositoryInMemory.create({
      name: 'Car_4',
      description: 'Car_description_4',
      daily_rate: 440.0,
      license_plate: 'license_plate_4',
      fine_amount: 40,
      brand: 'Car_brand_4',
      category_id: 'category_id_4',
    });

    const cars = await listAvailableCarsUseCase.execute({
      name: 'Car_4',
    });

    expect(cars).toEqual([car]);
  });
});

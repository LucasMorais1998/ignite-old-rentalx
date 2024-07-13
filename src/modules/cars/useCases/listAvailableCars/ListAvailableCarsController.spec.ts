import { Car } from '@modules/cars/infra/typeorm/entities/Car';
import { AuthUtils } from '@shared/__tests__/utils/AuthUtils';
import { DatabaseUtils } from '@shared/__tests__/utils/DatabaseUtils';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;
let genericCategoryId: string;
let specificCategoryId: string;
let unavailableCarName: string;
let unavailableCarBrand: string;

describe('List Available Cars Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await DatabaseUtils.createAdminUser(connection);

    genericCategoryId = uuidV4();
    await DatabaseUtils.createCategory(
      connection,
      genericCategoryId,
      'Generic Category Test',
      'Generic category test description'
    );

    specificCategoryId = uuidV4();
    await DatabaseUtils.createCategory(
      connection,
      specificCategoryId,
      'Specific Category Test',
      'Specific category test description'
    );

    unavailableCarName = 'Ford Fiesta';
    await DatabaseUtils.createCar(
      connection,
      uuidV4(),
      unavailableCarName,
      'Economy car',
      120.0,
      'ABC-1234',
      50,
      'Ford',
      genericCategoryId,
      false
    );

    unavailableCarBrand = 'BMW';
    await DatabaseUtils.createCar(
      connection,
      uuidV4(),
      'Car Test',
      'Economy car',
      120.0,
      'ABC-1234',
      50,
      unavailableCarBrand,
      specificCategoryId,
      false
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  afterEach(async () => {
    await connection.query('DELETE FROM cars');
  });

  const postCars = async (token: string, cars: Partial<Car>[]) => {
    for (const car of cars) {
      await request(app)
        .post('/cars')
        .send(car)
        .set({
          authorization: `Bearer ${token}`,
        });
    }
  };

  it('should return a list of available cars', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const expectedCategoryId = genericCategoryId;
    const newCarsData = [
      {
        name: 'BMW 320i',
        description: 'BMW car',
        daily_rate: 140.0,
        license_plate: 'DEF-5678',
        fine_amount: 65,
        brand: 'BMW',
        category_id: expectedCategoryId,
      },
      {
        name: 'Ford Mustang',
        description: 'Muscle car',
        daily_rate: 250.0,
        license_plate: 'XYZ-9876',
        fine_amount: 100,
        brand: 'Ford',
        category_id: expectedCategoryId,
      },
      {
        name: 'Tesla Model S',
        description: 'Electric luxury sedan',
        daily_rate: 300.0,
        license_plate: 'TESLA-001',
        fine_amount: 120,
        brand: 'Tesla',
        category_id: expectedCategoryId,
      },
    ];

    await postCars(token, newCarsData);

    const { body, status } = (await request(app)
      .get('/cars/available')
      .query({})) as { body: Car[]; status: any };

    expect(status).toBe(200);
    expect(body).toHaveLength(3);
    expect(body.map((car) => car.name)).toContain('BMW 320i');
    expect(body.map((car) => car.name)).toContain('Ford Mustang');
    expect(body.map((car) => car.name)).toContain('Tesla Model S');
    body.forEach((car) => expect(car.available).toBe(true));
  });

  it('should return a list of available cars for a given category id', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const expectedCategoryId = genericCategoryId;
    const unexpectedCategoryId = specificCategoryId;
    const newCarsData = [
      {
        name: 'BMW 320i',
        description: 'BMW car',
        daily_rate: 140.0,
        license_plate: 'DEF-5678',
        fine_amount: 65,
        brand: 'BMW',
        category_id: expectedCategoryId,
      },
      {
        name: 'Mercedes-Benz C300',
        description: 'Mercedes-Benz luxury sedan',
        daily_rate: 160.0,
        license_plate: 'JKL-3456',
        fine_amount: 75,
        brand: 'Mercedes-Benz',
        category_id: expectedCategoryId,
      },
      {
        name: 'Ford Mustang',
        description: 'Muscle car',
        daily_rate: 250.0,
        license_plate: 'XYZ-9876',
        fine_amount: 100,
        brand: 'Ford',
        category_id: unexpectedCategoryId,
      },
    ];

    await postCars(token, newCarsData);

    const { body, status } = (await request(app)
      .get('/cars/available')
      .query({ category_id: expectedCategoryId })) as {
      body: Car[];
      status: any;
    };

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    body.forEach((car) => {
      expect(car.category_id).toEqual(expectedCategoryId);
      expect(car.available).toBe(true);
      expect(car.name).not.toContain('Ford Mustang');
    });
  });

  it('should return a list of available cars for a given name', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const expectedCarName = 'Ford Mustang';
    const newCarsData = [
      {
        name: expectedCarName,
        description: 'Muscle car',
        daily_rate: 250.0,
        license_plate: 'XYZ-9876',
        fine_amount: 100,
        brand: 'Ford',
        category_id: genericCategoryId,
      },
      {
        name: expectedCarName,
        description: 'Muscle car',
        daily_rate: 250.0,
        license_plate: 'ABC-1034',
        fine_amount: 100,
        brand: 'Ford',
        category_id: genericCategoryId,
      },
      {
        name: 'BMW 320i',
        description: 'BMW car',
        daily_rate: 140.0,
        license_plate: 'DEF-5678',
        fine_amount: 65,
        brand: 'BMW',
        category_id: genericCategoryId,
      },
    ];

    await postCars(token, newCarsData);

    const { body, status } = (await request(app)
      .get('/cars/available')
      .query({ name: expectedCarName })) as {
      body: Car[];
      status: any;
    };

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    body.forEach((car) => {
      expect(car.name).toEqual(expectedCarName);
      expect(car.available).toBe(true);
      expect(car.name).not.toContain('BMW 320i');
    });
  });

  it('should return a list of available cars for a given brand', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const expectedCarBrand = 'Tesla';
    const newCarsData = [
      {
        name: 'Tesla Model S',
        description: 'Electric luxury sedan',
        daily_rate: 300.0,
        license_plate: 'TESLA-001',
        fine_amount: 120,
        brand: expectedCarBrand,
        category_id: genericCategoryId,
      },
      {
        name: 'Tesla Model 3',
        description: 'Electric compact sedan',
        daily_rate: 280.0,
        license_plate: 'TESLA-002',
        fine_amount: 110,
        brand: expectedCarBrand,
        category_id: genericCategoryId,
      },
      {
        name: 'BMW 320i',
        description: 'BMW car',
        daily_rate: 140.0,
        license_plate: 'DEF-5678',
        fine_amount: 65,
        brand: 'BMW',
        category_id: genericCategoryId,
      },
    ];

    await postCars(token, newCarsData);

    const { body, status } = (await request(app)
      .get('/cars/available')
      .query({ brand: expectedCarBrand })) as {
      body: Car[];
      status: any;
    };

    expect(status).toBe(200);
    expect(body).toHaveLength(2);
    body.forEach((car) => {
      expect(car.brand).toEqual(expectedCarBrand);
      expect(car.available).toBe(true);
      expect(car.brand).not.toContain('BMW');
    });
  });

  it.each([
    { brand: 'Ford Fiesta' },
    { name: 'BMW' },
    { category_id: '2b776214-ce0d-4b62-8939-6db94c2f2201' },
  ])(
    'should return an empty list when no cars available for criteria %s',
    async (params) => {
      const response = await request(app).get('/cars/available').query(params);

      const parsedUrl = new URL(response.request.url);
      const expectedSearchParams = new URLSearchParams(params).toString();

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
      expect(parsedUrl.searchParams.toString()).toBe(expectedSearchParams);
    }
  );
});

import { Car } from '@modules/cars/infra/typeorm/entities/Car';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import { hash } from 'bcrypt';
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

    const id = uuidV4();
    const password = await hash('admin', 8);
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license)
        values('${id}', 'admin', 'admin@rentalx.com.br', '${password}', true, 'now()', 'XXX-XXXX')`
    );

    genericCategoryId = uuidV4();
    await connection.query(
      `INSERT INTO CATEGORIES(id, name, description)
          values('${genericCategoryId}', 'Generic Category Test', 'Generic category test description')`
    );

    specificCategoryId = uuidV4();
    await connection.query(
      `INSERT INTO CATEGORIES(id, name, description)
          values('${specificCategoryId}', 'Specific Category Test', 'Specific category test description')`
    );

    unavailableCarName = 'Ford Fiesta';
    await connection.query(
      `INSERT INTO cars(id, name, description, daily_rate, license_plate, fine_amount, brand, category_id, available)
        values('${uuidV4()}', '${unavailableCarName}', 'Economy car', 120.0, 'ABC-1234', 50, 'Ford', '${genericCategoryId}', false)`
    );

    unavailableCarBrand = 'BMW';
    await connection.query(
      `INSERT INTO cars(id, name, description, daily_rate, license_plate, fine_amount, brand, category_id, available)
        values('${uuidV4()}', 'Car Test', 'Economy car', 120.0, 'ABC-1234', 50, '${unavailableCarBrand}', '${specificCategoryId}', false)`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  afterEach(async () => {
    await connection.query('DELETE FROM cars');
  });

  it('should return a list of available cars', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const expectedCategoryId = genericCategoryId;
    const newCars = [
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

    for (const newCar of newCars) {
      await request(app)
        .post('/cars')
        .send(newCar)
        .set({
          authorization: `Bearer ${token}`,
        });
    }

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
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const expectedCategoryId = genericCategoryId;
    const unexpectedCategoryId = specificCategoryId;
    const newCars = [
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

    for (const newCar of newCars) {
      await request(app)
        .post('/cars')
        .send(newCar)
        .set({
          authorization: `Bearer ${token}`,
        });
    }

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
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const expectedCarName = 'Ford Mustang';
    const newCars = [
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

    for (const newCar of newCars) {
      await request(app)
        .post('/cars')
        .send(newCar)
        .set({
          authorization: `Bearer ${token}`,
        });
    }

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
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const expectedCarBrand = 'Tesla';
    const newCars = [
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

    for (const newCar of newCars) {
      await request(app)
        .post('/cars')
        .send(newCar)
        .set({
          authorization: `Bearer ${token}`,
        });
    }

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

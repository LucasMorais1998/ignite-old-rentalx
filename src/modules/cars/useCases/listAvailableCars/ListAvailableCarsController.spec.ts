import { Car } from '@modules/cars/infra/typeorm/entities/Car';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import { hash } from 'bcrypt';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;
let categoryId: string;
let unavailableCarName: string;

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

    categoryId = uuidV4();

    await connection.query(
      `INSERT INTO CATEGORIES(id, name, description)
          values('${categoryId}', 'Category Name', 'Category for testing')`
    );

    unavailableCarName = 'Ford Fiesta';

    await connection.query(
      `INSERT INTO cars(id, name, description, daily_rate, license_plate, fine_amount, brand, category_id, available)
        values('${uuidV4()}', '${unavailableCarName}', 'Economy car', 120.0, 'ABC-1234', 50, 'Ford', '${categoryId}', false)`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should return a list of available cars', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const newCars = [
      {
        name: 'BMW 320i',
        description: 'BMW car',
        daily_rate: 140.0,
        license_plate: 'DEF-5678',
        fine_amount: 65,
        brand: 'BMW',
        category_id: categoryId,
      },
      {
        name: 'Ford Mustang',
        description: 'Muscle car',
        daily_rate: 250.0,
        license_plate: 'XYZ-9876',
        fine_amount: 100,
        brand: 'Ford',
        category_id: categoryId,
      },
      {
        name: 'Tesla Model S',
        description: 'Electric luxury sedan',
        daily_rate: 300.0,
        license_plate: 'TESLA-001',
        fine_amount: 120,
        brand: 'Tesla',
        category_id: categoryId,
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
  });

  it('should return a list of available cars for a given category id', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const newCar = {
      name: 'BMW 320i',
      description: 'BMW car',
      daily_rate: 140.0,
      license_plate: 'DEF-5678',
      fine_amount: 65,
      brand: 'BMW',
      category_id: categoryId,
    };

    await request(app)
      .post('/cars')
      .send(newCar)
      .set({
        authorization: `Bearer ${token}`,
      });

    const { body, status } = (await request(app)
      .get('/cars/available')
      .query({ category_id: categoryId })) as {
      body: Car[];
      status: any;
    };

    expect(status).toBe(200);
    expect(body[0].available).not.toBe(false);
    expect(body[0].category_id).toEqual(categoryId);
  });

  it('should return a list of available cars for a given name', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const newCarName = 'Ford Mustang';

    const newCar = {
      name: newCarName,
      description: 'Muscle car',
      daily_rate: 250.0,
      license_plate: 'XYZ-9876',
      fine_amount: 100,
      brand: 'Ford',
      category_id: categoryId,
    };

    await request(app)
      .post('/cars')
      .send(newCar)
      .set({
        authorization: `Bearer ${token}`,
      });

    const { body, status } = (await request(app)
      .get('/cars/available')
      .query({ name: newCarName })) as {
      body: Car[];
      status: any;
    };

    expect(status).toBe(200);
    expect(body[0].available).not.toBe(false);
    expect(body[0].name).toEqual(newCarName);
  });

  it('should return a list of available cars for a given brand', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const newCarBrand = 'Tesla';

    const newCar = {
      name: 'Tesla Model S',
      description: 'Electric luxury sedan',
      daily_rate: 300.0,
      license_plate: 'TESLA-001',
      fine_amount: 120,
      brand: newCarBrand,
      category_id: categoryId,
    };

    await request(app)
      .post('/cars')
      .send(newCar)
      .set({
        authorization: `Bearer ${token}`,
      });

    const { body, status } = (await request(app)
      .get('/cars/available')
      .query({ brand: newCarBrand })) as {
      body: Car[];
      status: any;
    };

    expect(status).toBe(200);
    expect(body[0].available).not.toBe(false);
    expect(body[0].brand).toEqual(newCarBrand);
  });

  it('should return an empty list when no cars available', async () => {
    const { body, status } = await request(app)
      .get('/cars/available')
      .query({ name: unavailableCarName });

    expect(status).toBe(200);
    expect(body).toHaveLength(0);
  });
});

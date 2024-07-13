import { AuthUtils } from '@shared/__tests__/utils/AuthUtils';
import { DatabaseUtils } from '@shared/__tests__/utils/DatabaseUtils';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;
let categoryId: string;

describe('Create Car Controller', () => {
  beforeEach(async () => {
    await connection.query('DELETE FROM cars');
    await connection.query('DELETE FROM categories');

    categoryId = uuidV4();
    await DatabaseUtils.createCategory(
      connection,
      categoryId,
      'Category Test',
      'Category test description'
    );
  });

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await DatabaseUtils.createAdminUser(connection);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able create a new car', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const newCarData = {
      name: 'Test Car',
      description: 'A test car',
      daily_rate: 180.0,
      license_plate: 'TEST-4321',
      fine_amount: 35,
      brand: 'Test Brand',
      category_id: categoryId,
    };

    const { status, body: createdCar } = await request(app)
      .post('/cars')
      .send(newCarData)
      .set({ authorization: `Bearer ${token}` });

    expect(status).toBe(201);
    expect(createdCar).toHaveProperty('id');
    expect(createdCar).toHaveProperty('created_at');
    expect(createdCar.available).toBe(true);
  });

  it('should not be able to create a car with an existing license plate', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const licensePlate = 'XYZ-1234';
    const firstCarData = {
      name: 'First Car',
      description: 'A test car',
      daily_rate: 100,
      license_plate: licensePlate,
      fine_amount: 50,
      brand: 'Test Brand',
      category_id: categoryId,
    };

    const secondCarData = {
      name: 'Second Car',
      description: 'A test car',
      daily_rate: 150,
      license_plate: licensePlate,
      fine_amount: 60,
      brand: 'Test Brand',
      category_id: categoryId,
    };

    await request(app)
      .post('/cars')
      .send(firstCarData)
      .set({ authorization: `Bearer ${token}` });

    const response = await request(app)
      .post('/cars')
      .send(secondCarData)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });
});

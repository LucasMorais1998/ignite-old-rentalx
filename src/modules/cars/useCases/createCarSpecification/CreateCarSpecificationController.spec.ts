import { AuthUtils } from '@shared/__tests__/utils/AuthUtils';
import { DatabaseUtils } from '@shared/__tests__/utils/DatabaseUtils';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;
let carId: string;
let categoryId: string;
let specificationId: string;

describe('Create Car Specification Controller', () => {
  beforeEach(async () => {
    categoryId = uuidV4();
    await DatabaseUtils.createCategory(
      connection,
      categoryId,
      'Category Test',
      'Category test description'
    );

    specificationId = uuidV4();
    await DatabaseUtils.createSpecification(
      connection,
      specificationId,
      'Specification Test',
      'Specification test description'
    );

    carId = uuidV4();
    await DatabaseUtils.createCar(
      connection,
      carId,
      'Car Test',
      'Car Test',
      120.0,
      'DXC-9991',
      50,
      'Test',
      categoryId,
      true
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

  it('should associate a specification with a valid car successfully', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const { status, body: car } = await request(app)
      .post(`/cars/specifications/${carId}`)
      .send({ specifications_id: [specificationId] })
      .set({ authorization: `Bearer ${token}` });

    expect(status).toBe(200);
    expect(car.specifications).toHaveLength(1);
    expect(car.specifications[0]).toHaveProperty('id');
    expect(car.specifications[0]).toHaveProperty('created_at');
  });

  it('should return error 400 when trying to associate a specification with a car that does not exist', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const invalidCarId = uuidV4();

    const response = await request(app)
      .post(`/cars/specifications/${invalidCarId}`)
      .send({ specifications_id: [specificationId] })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });
});

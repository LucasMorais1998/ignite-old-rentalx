import { Specification } from '@modules/cars/infra/typeorm/entities/Specification';
import { AuthUtils } from '@shared/__tests__/utils/AuthUtils';
import { DatabaseUtils } from '@shared/__tests__/utils/DatabaseUtils';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';

let connection: Connection;

describe('Create Specification Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await DatabaseUtils.createAdminUser(connection);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should create a new specification successfully', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const newSpecificationData = {
      name: 'Specification Test',
      description: 'Specification description test',
    };

    const response = await request(app)
      .post('/specifications')
      .send(newSpecificationData)
      .set({
        authorization: `Bearer ${token}`,
      });

    const createdSpecification = await connection
      .getRepository(Specification)
      .findOne({ where: { name: newSpecificationData.name } });

    expect(response.status).toBe(201);
    expect(createdSpecification).toBeTruthy();
    expect(createdSpecification.name).toEqual(newSpecificationData.name);
    expect(createdSpecification.description).toEqual(
      newSpecificationData.description
    );
  });

  it('should return a 400 error when trying to create a specification with a name that already exists', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const existingSpecificationData = {
      name: 'Specification Test',
      description: 'Specification description test',
    };

    await request(app)
    .post('/specifications')
    .send(existingSpecificationData)
    .set({
      authorization: `Bearer ${token}`,
    });

    const response = await request(app)
    .post('/specifications')
    .send(existingSpecificationData)
    .set({
      authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
  })
});

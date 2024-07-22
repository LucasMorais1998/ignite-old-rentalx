import { Category } from '@modules/cars/infra/typeorm/entities/Category';
import { AuthUtils } from '@shared/__tests__/utils/AuthUtils';
import { DatabaseUtils } from '@shared/__tests__/utils/DatabaseUtils';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';

let connection: Connection;

describe('Create Category Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await DatabaseUtils.createAdminUser(connection);
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM categories');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();

    await connection.query('DELETE FROM categories');
  });

  it('should create a new category successfully', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const newCategoryData = {
      name: 'Category Test',
      description: 'Category description test',
    };

    const response = await request(app)
      .post('/categories')
      .send(newCategoryData)
      .set({
        authorization: `Bearer ${token}`,
      });

    const createdCategory = await connection
      .getRepository(Category)
      .findOne({ where: { name: newCategoryData.name } });

    expect(response.status).toBe(201);
    expect(createdCategory).toBeTruthy();
    expect(createdCategory.name).toEqual(newCategoryData.name);
    expect(createdCategory.description).toEqual(newCategoryData.description);
  });

  it('should return a 400 error when trying to create a car with a name that already exists', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const existingCategoryData = {
      name: 'Category Test',
      description: 'Category description test',
    };

    await request(app)
      .post('/categories')
      .send(existingCategoryData)
      .set({
        authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post('/categories')
      .send(existingCategoryData)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});

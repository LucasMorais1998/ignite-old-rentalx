import { Category } from '@modules/cars/infra/typeorm/entities/Category';
import { AuthUtils } from '@shared/__tests__/utils/AuthUtils';
import { DatabaseUtils } from '@shared/__tests__/utils/DatabaseUtils';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';

let connection: Connection;

describe('List Categories Controller', () => {
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
  });

  it('should be able to list all categories', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const newCategoryData = {
      name: 'Category Test',
      description: 'Category test description',
    };

    await request(app)
      .post('/categories')
      .send(newCategoryData)
      .set({
        authorization: `Bearer ${token}`,
      });

    const { body, status } = (await request(app).get('/categories')) as {
      body: Category[];
      status: any;
    };

    expect(status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toHaveProperty('id');
    expect(body[0].name).toEqual('Category Test');
    expect(body[0].description).toEqual('Category test description');
    expect(body[0]).toHaveProperty('created_at');
  });

  it('should return an empty list if there are no categories', async () => {
    const { body, status } = (await request(app).get('/categories')) as {
      body: Category[];
      status: any;
    };

    expect(status).toBe(200);
    expect(body).toHaveLength(0);
  });
});

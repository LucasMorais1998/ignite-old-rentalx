import { DatabaseUtils } from '@shared/__tests__/utils/DatabaseUtils';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;

describe('List Categories Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await DatabaseUtils.createAdminUser(connection);

    await DatabaseUtils.createCategory(
      connection,
      uuidV4(),
      'Category Test 1',
      'Category test description 1'
    );

    await DatabaseUtils.createCategory(
      connection,
      uuidV4(),
      'Category Test 2',
      'Category test description 2'
    );

    await DatabaseUtils.createCategory(
      connection,
      uuidV4(),
      'Category Test 3',
      'Category test description 3'
    );
  });
  
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should list all categories successfully', async () => {
    const response = await request(app).get('/categories');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
  });

  it('should return an empty list if there are no categories', async () => {
    await connection.query('DELETE FROM categories');

    const response = await request(app).get('/categories');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
});

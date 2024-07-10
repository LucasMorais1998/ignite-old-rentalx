import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import { hash } from 'bcrypt';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;

describe('Create Category Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash('admin', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license)
        values('${id}', 'admin', 'admin@rentalx.com.br', '${password}', true, 'now()', 'XXX-XXXX')`
    );
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM categories');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new category', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/categories')
      .send({
        name: 'Category Test 1',
        description: 'Category test description 1',
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new category with name exists', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    await request(app)
    .post('/categories')
    .send({
      name: 'Category Test 1',
      description: 'Category test description 1',
    })
    .set({
      authorization: `Bearer ${token}`,
    });

    const response = await request(app)
      .post('/categories')
      .send({
        name: 'Category Test 1',
        description: 'Category test description 1',
      })
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
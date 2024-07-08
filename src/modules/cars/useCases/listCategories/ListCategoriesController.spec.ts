import { Category } from '@modules/cars/infra/typeorm/entities/Category';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import { hash } from 'bcrypt';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;

describe('List Category Controller', () => {
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

  it('should be able to list all categories', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    await request(app)
      .post('/categories')
      .send({
        name: 'Category Test',
        description: 'Category test description',
      })
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

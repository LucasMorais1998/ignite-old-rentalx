import { Category } from '@modules/cars/infra/typeorm/entities/Category';
import { AuthUtils } from '@shared/__tests__/utils/AuthUtils';
import { DatabaseUtils } from '@shared/__tests__/utils/DatabaseUtils';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;

describe('Import Category Controller', () => {
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

  it('should import categories from CSV file successfully', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const filePath = path.resolve(
      __dirname,
      '../../../../shared/__tests__/resources/categories-file-mock.csv'
    );

    const file = fs.createReadStream(filePath);

    const response = await request(app)
      .post('/categories/import')
      .attach('file', file, 'categories-file-mock.csv')
      .set({
        authorization: `Bearer ${token}`,
      });

    const importedCategoriesResponse = await request(app).get('/categories');
    const categories = importedCategoriesResponse.body;

    expect(response.status).toBe(201);
    expect(categories).toHaveLength(9);
    expect(categories[0]).toMatchObject({
      name: 'SUV',
      description: 'Utilitário esportivo',
    });
  });

  it('should not import categories that already exist', async () => {
    const token = await AuthUtils.authenticateAdmin();

    const existingCategoriesDate = [
      {
        name: 'SUV',
        description: 'Utilitário esportivo',
      },
      {
        name: 'Sedan',
        description: 'Automóvel de três volumes',
      },
      {
        name: 'Hatch',
        description: 'Carro curto',
      },
      {
        name: 'Picape',
        description: 'Caminhonete de carga',
      },
    ];

    for (const category of existingCategoriesDate) {
      await DatabaseUtils.createCategory(
        connection,
        uuidV4(),
        category.name,
        category.description
      );
    }

    const filePath = path.resolve(
      __dirname,
      '../../../../shared/__tests__/resources/categories-file-mock.csv'
    );

    const file = fs.createReadStream(filePath);

    const response = await request(app)
      .post('/categories/import')
      .attach('file', file, 'categories-file-mock.csv')
      .set({
        authorization: `Bearer ${token}`,
      });

    const importedCategoriesResponse = await request(app).get('/categories');
    const categories: Category[] = importedCategoriesResponse.body;

    const expectedCategories = [
      { name: 'SUV', description: 'Utilitário esportivo' },
      { name: 'Sedan', description: 'Automóvel de três volumes' },
      { name: 'Hatch', description: 'Carro curto' },
      { name: 'Picape', description: 'Caminhonete de carga' },
      { name: 'Coupé', description: 'Carro esportivo de duas portas' },
      { name: 'Minivan', description: 'Veículo de transporte de passageiros' },
      { name: 'Caminhão', description: 'Caminhão de carga' },
      {
        name: 'Crossover',
        description: 'Carro com características de SUV e sedan',
      },
      { name: 'Convertible', description: 'Carro conversível' },
    ];

    expect(response.status).toBe(201);
    expect(categories.length).toBe(expectedCategories.length);
    expectedCategories.forEach((expectedCategory) => {
      const categoryInDb = categories.find(
        (category) => category.name === expectedCategory.name
      );

      expect(categoryInDb).toBeDefined();
      expect(categoryInDb.name).toBe(expectedCategory.name);
      expect(categoryInDb.description).toBe(expectedCategory.description);
    });
  });
});

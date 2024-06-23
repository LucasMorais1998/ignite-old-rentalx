import { v4 as uuidV4 } from 'uuid';
import createConnection from '../index';

async function createCars() {
  const connection = await createConnection('localhost');

  const suvCategory = await connection.query(
    `SELECT id FROM categories WHERE name = 'SUV' LIMIT 1`
  );
  const sedanCategory = await connection.query(
    `SELECT id FROM categories WHERE name = 'Sedan' LIMIT 1`
  );

  const suvCategoryId = suvCategory[0].id;
  const sedanCategoryId = sedanCategory[0].id;

  const cars = [
    {
      id: uuidV4(),
      name: 'Audi Q5',
      description: 'Carro marca Audi',
      daily_rate: 150.0,
      license_plate: 'ABC-1234',
      fine_amount: 70,
      brand: 'Audi',
      category_id: suvCategoryId,
      created_at: 'now()',
    },
    {
      id: uuidV4(),
      name: 'BMW 320i',
      description: 'Carro marca BMW',
      daily_rate: 140.0,
      license_plate: 'DEF-5678',
      fine_amount: 65,
      brand: 'BMW',
      category_id: sedanCategoryId,
      created_at: 'now()',
    },
    {
      id: uuidV4(),
      name: 'Mercedes A200',
      description: 'Carro marca Mercedes',
      daily_rate: 130.0,
      license_plate: 'XYZ-9876',
      fine_amount: 60,
      brand: 'Mercedes',
      category_id: sedanCategoryId,
      created_at: 'now()',
    },
  ];

  for (const car of cars) {
    await connection.query(
      `INSERT INTO cars(id, name, description, daily_rate, license_plate, fine_amount, brand, category_id, created_at)
        values('${car.id}', '${car.name}', '${car.description}', ${car.daily_rate}, '${car.license_plate}', ${car.fine_amount}, '${car.brand}', '${car.category_id}', '${car.created_at}')`
    );
  }

  await connection.close();
}

createCars().then(() => console.log('Cars created!'));

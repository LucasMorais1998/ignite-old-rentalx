import { hash } from 'bcrypt';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

class DatabaseUtils {
  static async createAdminUser(connection: Connection) {
    const id = uuidV4();
    const password = await hash('admin', 8);

    await connection.query(
      'INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, 'admin', 'admin@rentalx.com.br', password, true, 'now()', 'XXX-XXXX']
    );
  }

  static async createCategory(
    connection: Connection,
    id: string,
    name: string,
    description: string
  ) {
    await connection.query(
      'INSERT INTO CATEGORIES(id, name, description) VALUES ($1, $2, $3)',
      [id, name, description]
    );
  }

  static async createCar(
    connection: Connection,
    id: string,
    name: string,
    description: string,
    dailyRate: number,
    licensePlate: string,
    fineAmount: number,
    brand: string,
    categoryId: string,
    available: boolean
  ) {
    await connection.query(
      'INSERT INTO cars(id, name, description, daily_rate, license_plate, fine_amount, brand, category_id, available) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        id,
        name,
        description,
        dailyRate,
        licensePlate,
        fineAmount,
        brand,
        categoryId,
        available,
      ]
    );
  }
}

export { DatabaseUtils };

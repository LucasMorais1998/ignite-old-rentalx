import { app } from '@shared/infra/http/app';
import request from 'supertest';

class AuthUtils {
  static async authenticateAdmin(): Promise<string> {
    const response = await request(app).post('/sessions').send({
      email: 'admin@rentalx.com.br',
      password: 'admin',
    });

    const { token } = response.body;
    return token;
  }
}

export { AuthUtils };

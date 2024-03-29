import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { UsersRepository } from '@modules/accounts/repositories/implementations/UsersRepository';
import { ICategoriesRepository } from '@modules/cars/repositories/ICategoriesRepository';
import { ISpecificationRepository } from '@modules/cars/repositories/ISpecificationsRepository';
import { CategoriesRepository } from '@modules/cars/repositories/implementations/CategoriesRepository';
import { SpecificationRepository } from '@modules/cars/repositories/implementations/SpecificationsRepository';
import { container } from 'tsyringe';

container.registerSingleton<ICategoriesRepository>(
  'CategoriesRepository',
  CategoriesRepository
);

container.registerSingleton<ISpecificationRepository>(
  'SpecificationRepository',
  SpecificationRepository
);

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository
);

import { Router } from 'express';
import multer from 'multer';

import { CreateCategoryController } from '@modules/cars/useCases/createCategory/CreateCategoryController';
import { ImportCategoryController } from '@modules/cars/useCases/importCategory/ImportCategoryController';
import { ListCategoriesController } from '@modules/cars/useCases/listCategories/ListCategoriesController';
import { ensureAdmin } from '../middlewares/ensureAdmin';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const categoriesRoutes = Router();

const upload = multer({
  dest: './tmp',
});

const createCategoryController = new CreateCategoryController();
const importCategoryController = new ImportCategoryController();
const listCategoriesController = new ListCategoriesController();

categoriesRoutes.get('/', listCategoriesController.handle);

categoriesRoutes.post(
  '/',
  ensureAuthenticated,
  ensureAdmin,
  createCategoryController.handle
);

categoriesRoutes.post(
  '/import',
  ensureAuthenticated,
  ensureAdmin,
  upload.single('file'),
  importCategoryController.handle
);

export { categoriesRoutes };

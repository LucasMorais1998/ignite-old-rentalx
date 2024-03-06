import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';
import { CreateSpecificationController } from '@modules/cars/useCases/createSpecification/CreateSpecificationController';
import { Router } from 'express';

const specificationRoutes = Router();

const createSpecificationController = new CreateSpecificationController();

specificationRoutes.use(ensureAuthenticated);
specificationRoutes.post('/', createSpecificationController.handle);

export { specificationRoutes };

import {Router} from 'express';
import UserController from './src/app/controllers/userController';
import SessionController from './src/app/controllers/sessionController';
import { defaultFormat } from 'moment';
const routes = new Router();
import authMiddleware from './src/app/middlewares/auth';

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.put('/users', authMiddleware ,UserController.update);

export default routes;
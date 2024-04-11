import express from 'express'
import adminMiddleware from '../middleware/adminMiddleware.js';
import adminController from '../controllers/adminController.js'

const controller = adminController;
const routerAdmin = express.Router();

routerAdmin.get("/users", adminMiddleware(['admin']), controller.getUsers)

export default routerAdmin
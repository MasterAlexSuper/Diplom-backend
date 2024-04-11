import express from "express";
import authController from "../controllers/AuthController.js";
import { check } from 'express-validator'

const controller = authController
const routerAuth = express.Router()

routerAuth.post('/registration', [
   check('username', "Имя пользователя не должно быть пустым").notEmpty(),
   check('password', "Пароль должен быть от 4 до 10 символов").isLength({ min: 4, max: 10 }),
], controller.registration)
routerAuth.post('/login', controller.login)
routerAuth.put('/edit', check('username', "Имя пользователя не должно быть пустым").notEmpty(), controller.editUser)

export default routerAuth
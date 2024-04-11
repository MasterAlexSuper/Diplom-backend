import User from '../models/User.js'
import Roles from '../models/Role.js'
import bcrypt from 'bcryptjs'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { secret } from '../config.js'
import cookieParser from 'cookie-parser'
import Token from '../models/Token.js'


const isValidRefreshToken = async (refreshToken) => {
   try {
      const decodedToken = jwt.verify(refreshToken, secret);
      if (!decodedToken) {
         return false
      }
      const { username } = decodedToken;
      const bdToken = await Token.findOne({ username: username })
      if (refreshToken == bdToken) {
         return true
      }
      return false
   } catch (error) {
      console.log(error);
   }
}


const verifyAccessToken = (token) => {
   try {
      const decoded = jwt.verify(token, secret);
      return decoded;
   } catch (error) {
      return null;
   }
}


const generateRefreshToken = (id, roles, username) => {
   const payload = {
      id, username, roles,
   }
   return jwt.sign(payload, secret, { expiresIn: "30d" })
}

const generateAccessToken = async (id, roles) => {
   const payload = {
      id, roles, exp: Math.floor(Date.now() / 1000) + (15 * 60)
   }
   return jwt.sign(payload, secret, { expiresIn: "30min" })
}



class AuthController {
   async registration(req, res) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).send({ message: "Ошибка при регистрации", errors })
         }
         const { username, password, fullname, phonenumber,
            email, contractId, consumed, balance, tarif, gasMeter } = req.body
         const candidate = await User.findOne({ username })
         if (username.trim() == "") {
            return res.status(400).send({ message: "Пользователь должен иметь имя" })
         }
         if (candidate) {
            return res.status(400).send({ message: "Пользователь с тамким именем уже существует" })
         }
         const hashPassword = bcrypt.hashSync(password, 5)
         const userRole = await Roles.findOne({ value: "user" })

         const userDetails = {
            fullname: fullname || "",
            phonenumber: phonenumber || "",
            email: email || "",
            contractId: contractId || "",
            consumed: consumed || "",
            balance: balance || "",
            tarif: tarif || "Фіксований",
            gasMeter: gasMeter || ""
         };

         const user = new User({ username, password: hashPassword, userDetails, roles: [userRole.value] })
         await user.save()
         return res.status(200).send({ message: "User created" })
      } catch (error) {
         console.log(error);
         return res.status(500).send({ message: "Ошибка регистрации" })
      }
   }
   async editUser(req, res) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            return res.status(400).send({ message: "Имя пользователя не может быть пустым", errors })
         }
         const { username, password, email, fullname, phonenumber } = req.body;
         if (!username) {
            return res.status(400).send("Такого пользователя нет")
         }

         const user = await User.findOne({ username });

         let newPassword;
         if (password) {
            newPassword = await bcrypt.hash(password, 10); // Шифрование нового пароля
         } else {
            newPassword = user.password; // Использование текущего пароля
         }

         const renewedUser = {
            username,
            password: newPassword,
            userDetails: {
               ...user.toObject().userDetails,
               email: email || user.userDetails.email,
               fullname: fullname || user.userDetails.fullname,
               phonenumber: phonenumber || user.userDetails.phonenumber
            }
         };

         const userToEdit = await User.findOneAndUpdate({ username }, renewedUser);
         return res.status(200).send({ message: "Пользователь успещно изменен", renewedUser, user })
      } catch (error) {
         console.log(error);
         return res.status(400).send({ message: "Не удалось изменить пользователя" })
      }
   }

   async login(req, res) {
      try {
         const { username, password } = req.body
         if (!username) {
            return res.status(401).send({ message: `Пользователя ${username} не существует` })
         }
         const user = await User.findOne({ username })
         const hash = user.password;
         const isValid = bcrypt.compareSync(password, hash);
         if (!isValid) {
            return res.status(400).send({ message: "Пароль не верный" })
         }
         const accessToken = generateAccessToken(user._id, user.roles)
         const refreshToken = generateRefreshToken(user._id, user.roles, user.username)
         res.cookie('accessToken', refreshToken, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
         return res.status(200).send({ token: accessToken })
      } catch (error) {
         console.log(error);
         return res.status(500).send({ message: "Ошибка входа" })
      }
   }
   async getUsers(req, res) {
      try {
      } catch (error) {
         console.log(error);
      }
   }
   async getUser(req, res) {
      try {
         const expiredAccessToken = req.headers.authorization.split(' ')[1];
         const decodedToken = verifyAccessToken(expiredAccessToken);
         if (!decodedToken) {
            return res.status(401).json({ message: 'Invalid token' });
         }
         if (decodedToken.exp * 1000 > Date.now()) {
            const refreshToken = req.cookies.refreshToken;
            if (!isValidRefreshToken(refreshToken)) {
               return res.status(401).json({ message: 'Invalid refresh token' });
            }
            const decodedRefreshToken = verifyAccessToken(refreshToken)
            const user = await User.findOne({ username: decodedRefreshToken.username })
            const newAccessToken = generateAccessToken(decodedToken.user);
            res.json({ accessToken: newAccessToken, data: user });
         }
         const userId = decodedToken.id;
         const user = await User.findById(userId)
         return res.status(200).send({data: user})
      } catch (error) {
         console.log(error);
      }
   }
}

export default new AuthController();

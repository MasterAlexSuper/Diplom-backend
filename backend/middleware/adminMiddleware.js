import jwt from 'jsonwebtoken'
import { secret } from '../config.js';

export default function (roles) {
   return function (req, res, next) {
      if (req.method === "OPTIONS") {
         next();
      }
      try {
         const token = req.headers.authorization.split(" ")[1];
         if (!token) {
            return res.status(403).send({ message: "Пользователь не авторизирован " })
         }
         const { roles: userRoles } = jwt.verify(token, secret)
         let hasAccess = false
         userRoles.forEach(role => {
            if (roles.includes(role)) {
               hasAccess = true;
            }
            if (!hasAccess) {
               return res.status(403).send({ message: "У вас нет доступа" })
            }
         });
         next()
      } catch (error) {
         console.log(error);
         return res.status(403).send({ message: "Пользователь не авторизирован " })
      }
   }
}
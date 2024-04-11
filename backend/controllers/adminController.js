import User from '../models/User.js'

class adminController {
   async getUsers(req, res) {
      try {
         const users = await User.find({})
         return res.status(200).send({ count: users.length, users })
      } catch (error) {
         console.log(error);
         return res.status(400).send({ message: "Возникла ошибка при получении пользователей" })
      }
   }
}

export default new adminController();
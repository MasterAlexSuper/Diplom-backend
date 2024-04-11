import express from 'express'
import { PORT, mongoUrl } from './config.js'
import mongoose from 'mongoose'
import routerAuth from './routes/authRouts.js'
import routerAdmin from './routes/adminRouts.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/auth', routerAuth)
app.use('/admin', routerAdmin)

const start = async () => {
   app.listen(PORT, () => console.log(`Server conected port: ${PORT}`))
   try {
      mongoose.connect(mongoUrl)
      console.log("Server conected to DB");
   } catch (error) {
      console.log(error);
   }
}

start()
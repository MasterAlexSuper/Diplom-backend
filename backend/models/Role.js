import { Schema, model } from "mongoose";


const Roles = new Schema({
   value: {
      type: String,
      unique: true,
      default: "user"
   }
})

export default model('Roles', Roles)
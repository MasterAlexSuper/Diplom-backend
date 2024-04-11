import { Schema, model } from "mongoose";


const Token = new Schema(
   {
      username: {
         type: String,
         required: true,
         unique: true
      },
      access: {
         type: String,
         unique: true,
         default: "user"
      },
      refresh: {
         type: String,
         unique: true,
         default: "user"

      }
   }
)

export default model('Token', Token)
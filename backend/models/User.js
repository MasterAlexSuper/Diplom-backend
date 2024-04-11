import { Schema, model } from "mongoose";

const User = new Schema({
   username: {
      type: String,
      required: true,
      unique: true
   },
   password: {
      type: String,
      required: true

   },
   userDetails: {
      fullname: String,
      phonenumber: String,
      email: String,
      contractId: String,
      consumed: String,
      balance: String,
      tarif: String,
      gasMeter: String
   },
   roles: [{
      type: String, ref: "Role"
   }]
})
export default model("User", User)
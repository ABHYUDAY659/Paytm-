import mongoose, { Schema, model } from "mongoose";

mongoose.connect("mongodb+srv://Abhyuday:Ai68frDLrCnGf6p8@cluster0.s4epypq.mongodb.net/Gpay");

const userSchema = new Schema({
    firstname : String,
    lastname  : String,
    username : String,
    password : String,
    
});


const accountSchema = new Schema({

    userId : {type:mongoose.Schema.Types.ObjectId , ref:'Users' , required:true},
    balance : {type: Number , required : true}

})


export const UserModel = model("Users" , userSchema);
export const AccountModel = model("Account" , accountSchema);

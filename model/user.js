const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {   
        fname:{type:String, required:true},
        lname:{type:String, required:true},
        username:{type: String,required: true,unique:true},
        password:{type: String,required: true },
        phnumber:{type:Number,required:true}
    },
    {collection: 'users'}
)
const model = mongoose.model('UserSchema', UserSchema)

module.exports = model
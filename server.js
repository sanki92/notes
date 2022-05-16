const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/user');  //schema
const noteschemas = require('./model/note') 
const bcrypt = require('bcryptjs');       //for hashing the password
const jwt = require('jsonwebtoken');  //autenticate the user
const JWT_SECRET =  process.env.JWT_SECRET


// Connecting mongoDB to backend
mongoose.connect('mongodb://localhost:27017/login-app-db',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const app = express();

// to serve the files located at this location👇
app.use('/', express.static(path.join(__dirname,'static')))

// used instead of body parser 👉 " extracts the entire body portion of an incoming request stream and exposes it on req.body " it's a middleware
app.use(express.json()) 


// CHANGE OR UPDATE PASSWORD  
app.post('/api/change-password', async(req, res)=>{
    const {token, newPassword:plainTextPassword} = req.body;

    // checks
    if(!plainTextPassword || typeof plainTextPassword != 'string'){
        return res.json({status:'error', error : 'Invalid Password'})
    }
    if(plainTextPassword.length < 5){
        return res.json({status:'error', error : 'Password is too short, it should be aleast 6 character'})
    }
    try {
        // verifying the user using token that we get from frontend and Jwt secret
        const user = jwt.verify(token, JWT_SECRET)
        /* Don't get confused ki " user.id " kaha se aaya!! Ye 👆 jo upar se Token le rhe ho na 
            jwt.verify usko JWT_SECRET ki help se decode kardega,aur token
            hi mai tumhara ye 👇 wla user rhega
        */
        const _id = user.id
        const password = await bcrypt.hash(plainTextPassword, 10)
        await User.updateOne({_id},{
            $set:{password}
        })
        res.json({status:'ok'})
    } catch (error) {
        res.json({status:'error', error:";-)"})
    }
})







// LOGIN
app.post('/api/login', async(req, res)=>{

    const {username, password} = req.body;
    const user = await User.findOne({username}).lean();

    if(!user){
        return res.json({status:'error', error:'Username or Password is not correct'})
    }

    if(await bcrypt.compare(password, user.password)){
        // the username, password combination is successful
        const token = jwt.sign({
            id:user._id,
            username: user.username
            }, JWT_SECRET)

        return res.json({status:'ok', data:token,message:"Succesfully Logged In",userID:user._id})
    }
    return res.json({status:'error', error:'Username or Password is not correct'})
})



// PROFILE 
app.post('/api/profile', async(req, res)=>{
    const {token, userID} = req.body;
    const user = jwt.verify(token, JWT_SECRET)
    const userData = await User.findById(userID).lean();
    return res.json({status:'ok', userID:userData._id,username:userData.username})
})



// CREATE NOTE
app.post('/api/create-note', async(req, res)=>{
    const {token, txtarea_title,txtarea_txt} = req.body;

    if(!txtarea_title || typeof txtarea_title !="string"){
        return res.json({status:'error', message : 'Write a Valid Title'})
    }
    if(!txtarea_txt || typeof txtarea_txt !="string"){
        return res.json({status:'error', message : 'Write a Valid Description'})
    }

    const user = jwt.verify(token, JWT_SECRET)
    const userID = user.id
    try {
        const response = await noteschemas.create({
            user:userID,
            txtarea_title,
            txtarea_txt
        })
        // console.log("Note created successfully",response);
    } catch (error) {
        throw error;
    }
    return res.json({status:'ok', message:"Note Created Successfully"})
})


// GET NOTE 

app.post('/api/get-note', async(req, res)=>{
    const {token} = req.body;
        const user = jwt.verify(token, JWT_SECRET)
        const userID = user.id
        var message=""
                const response = await noteschemas.find({user:`${userID}`}).lean();
                if(response.length>0){
                    message="Note Loaded Successfully"                }
                else{
                    message="No Notes Availabe Right Now, Write a Note..."
                }
    return res.json({status:'ok', message:message,Notes:response})
})


// DELETE NOTE 

app.delete('/api/del-note', async(req, res)=>{
    const {token,noteID} = req.body;
        const user = jwt.verify(token, JWT_SECRET)
        const userID = user.id
        console.log(noteID)
        const response = await noteschemas.findOneAndDelete({_id:`${noteID}`});
        
    return res.json({status:'ok', message:"Note Deleted Successfully",response:response})
})









//  REGISTER
app.post('/api/register', async(req, res) => {
    
    // Destructing user data from frontend I guess...
    const {fname,lname,username, password:plainTextPassword,phnumber} = req.body;
  
    // Checks
    if(!username || typeof username != 'string'){
        return res.json({status:'error', error : 'Invalid Username'})
    }
    if(!plainTextPassword || typeof plainTextPassword != 'string'){
        return res.json({status:'error', error : 'Invalid Password'})
    }
    if(plainTextPassword.length < 5){
        return res.json({status:'error', error : 'Password is too short, it should be aleast 6 character'})
    }
    if(phnumber.length!==10){
        return res.json({status:'error', error : 'Invalid Phone Number'})
    }

    // Hashing
    const password = await bcrypt.hash(plainTextPassword, 10);

    // Trying and catching errors
    try {
        // creating new user on the basis of "User Schema"
        const response = await User.create({
            fname,
            lname,
            username,
            password,
            phnumber
        })

        console.log("User created successfully",response);
    } 
    catch (error) {
        if(error.code === 11000){
        return res.json({status:'error', error:"User already in use, Try Login"});
        }
        throw error;
    }
    res.json({status:'ok'})
})


app.listen(80,()=>{
    console.log('Server up at 80')
})
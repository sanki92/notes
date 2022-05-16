const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
    {   
        user:{type: mongoose.Schema.Types.ObjectId},
        txtarea_title:{type:String,required:true},
        txtarea_txt:{type:String,required:true}
    },
)
const model = mongoose.model('NoteSchema', NoteSchema)

module.exports = model
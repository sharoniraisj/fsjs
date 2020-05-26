var mongoose = require('mongoose');
const userSchema = mongoose.Schema({

    "_id" : mongoose.Schema.Types.ObjectId,

    "name":String,
    "lastname":String,

    "email" : {
        "type"     : String,
        "required" : true,
        "unique"   : true,
        "match"    : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },

    "pass" : {
        "type"     : String,
        "required" : true
    }
});

const User = mongoose.model("User", userSchema); 
module.exports = User;                           

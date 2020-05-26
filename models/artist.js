var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var artistSchema = Schema ({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    image: String,
    tracks: [{type: String}]
});

var Artist = mongoose.model('Artist', artistSchema);
module.exports = Artist;

//eof

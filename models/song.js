var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var songSchema = Schema ({
    "name": String,
    "image": String,
    "duration": String,
    "file": String,
    "album": String,
    "artist": { type: Schema.ObjectId, ref: 'Artist' }
});

module.exports = mongoose.model('Song', songSchema);

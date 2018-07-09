const mongoose = require('mongoose');

var Schema = mongoose.Schema({
    createdAt:{
        type: Date,
        default: Date.now
    },
    ChatID: {type: String, unique: true},
    OriginalDate: Date,
    ClientType: Number,
    VisitorID: String,
    OperatorID: String
})

module.exports = mongoose.model('Chat', Schema);
const mongoose = require('mongoose');

var Schema = mongoose.Schema({
    createdAt:{
        type: Date,
        default: Date.now
    },
    OperatorID: {type: String, unique: true},
    Name: String,
    // PermissionGroupID: String,
    EmailAvailable: Boolean,
    FacebookAvailable: Boolean,
    TicketAvailable: Boolean,
    ChatAvaialble: Boolean,
    TwitterAvailable: Boolean
})

module.exports = mongoose.model('Operator', Schema);
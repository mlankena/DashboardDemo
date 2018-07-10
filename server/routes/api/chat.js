// API Key: hAlrS2Fl4bIvvv3Qc3yesd4+A9/34w3ygfMzhkTG3gSD/ZH3CoRFLM2ReBQ2garn42FibaPfcB9FLAltLb0vTA==
// Account ID: 706505873793485629
// API Settings ID: 97979484132497609
const mongoose = require('mongoose');
//import models
const Chat = require('../../models/Chat');
const request = require('superagent');
var CryptoJS = require("crypto-js");
var accountId = "706505873793485629";
var apiKeyId = "97979484132497609";
var apiKey = "hAlrS2Fl4bIvvv3Qc3yesd4+A9/34w3ygfMzhkTG3gSD/ZH3CoRFLM2ReBQ2garn42FibaPfcB9FLAltLb0vTA==";
var auth = accountId + ':' + apiKeyId + ':' + (new Date()).getTime();
var authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
}

const findChat = async (chatID) => {
    var parameter = chatID ? {ChatID : chatID} : {}
    
    try{
        return await Chat.findOne(parameter)
    } catch(e) {
        return e;
    }
}

const findNewestChat = async() => {
    try{
        return await Chat.findOne({}, {}, { sort: { 'OriginalDate' : -1 } })
    } catch(e) {
        return e
    }
}

module.exports = (app) => {
    /**
     * Get all chat ID's and save to DB. Need to split saving chat info into two call (could've done it in one, but this was looking pretty gross. Need to refactor)
     */
    app.post('/api/chat/getAllChatMessages', function (req, res, next) {
        var results = [];
        auth = accountId + ':' + apiKeyId + ':' + (new Date()).getTime();
        authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);
        var url = 'https://api.boldchat.com/aid/706505873793485629/data/rest/json/v2/getAllChatMessages?auth=' + authHash;
        request
        .get(url)
        .then(async (response) => {
            try {
                var jsonObject = JSON.parse(response.text);
            } catch(e) {
                var jsonObject = {};
                //console.log("error: " + e);
            }
            if (jsonObject.Status == "success" && jsonObject.Truncated == false) {
                /*
                    I don't typically take things from stack overflow, but this was necessary as I was spending too much time trying to figure out 
                    synchronization issues when querying the database.
                    
                    I believe that the runtime of this is O(N^2) since it's essentially a for-loop nested in a for-loop.
                */
                var uniqueChats = jsonObject.Data.filter( function(el, i, self) {
                    return i == self.findIndex((t) => {
                        return t.ChatID == el.ChatID
                    });
                });
                const removeDuplicates = async () => {
                    let chatsToSave = []
                    await asyncForEach(uniqueChats, async(chat) => {
                        try {
                            const foundChat = await findChat(chat.ChatID);
                            if(!foundChat) {
                                const chatRecord = {
                                    ChatID:chat.ChatID,
                                    OriginalDate:chat.Created
                                };
                                chatsToSave.push(chatRecord);
                            }
                        } catch (e) {
                            console.log("Error");
                        }
                    });
                    console.log(chatsToSave.length);
                    return chatsToSave
                }
                console.log("calling remove duplicates");
                let chatsToSave = await removeDuplicates();
                console.log("done");
                results.push(chatsToSave);
                if(chatsToSave){
                    await Chat.collection.insertMany(chatsToSave, function(err){
                        if(err){
                            //console.log("error " + err);
                        } else {
                            // todo: make this the response
                        }
                    });
                    res.send({
                        success: true,
                        message: 'Chat info',
                        results: chatsToSave
                    });
                }

            }
        });
    });

    /**
     * Saving all chat info is very slow since we need to make N number of calls to the boldchat API, with N being the number of unique
     * chatID's. We'll should hopefully only need to do this on the first visit.
     */
    app.post('/api/chat/saveAllChatInfo', function(req, res, next){
        console.log("saving now");
        Chat.distinct('ChatID', async (err, chats) => {
            console.log("returning " + chats.length);
            const updateChats = async() => {
                await asyncForEach(chats, async (key, i) => {
                    auth = accountId + ':' + apiKeyId + ':' + (new Date()).getTime();
                    authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);
                    var url = 'https://api.boldchat.com/aid/706505873793485629/data/rest/json/v2/getChat?auth=' + authHash;
                    await request
                        .get(url)
                        .query({ChatID: key})
                        .then(async (response) => {
                            try {
                                var jsonObject = JSON.parse(response.text);
                            } catch (e) {
                                var jsonObject = {};
                                //console.log("error: " + e);
                                return null;
                            }
                            if (jsonObject.Status == "success") {
                                const chatRecord = {
                                    ClientType : jsonObject.Data.ClientType,
                                    VisitorID : jsonObject.Data.VisitorID,
                                    OperatorID : jsonObject.Data.OperatorID
                                };
                                await Chat.update({ChatID : jsonObject.Data.ChatID}, {$set : chatRecord}, async (err, doc) => {
                                    if(err) {
                                        console.log("got error");
                                    } else {
                                        //console.log("Saved");
                                    }
                                })
                            }
                        });
                });
            }   
            await updateChats();
            console.log("Done");
            res.send({
                success: true,
                message: 'updated chats'
            })
        })
    });
    app.post('/api/chat/addMobileVisitors', (req, res) => {
        chatID = Math.floor(Math.random() * 10000);
        let chatObject = {
            OriginalDate: Date.now(),
            ClientType: 0,
            VisitorID: 10,
            OperatorID: 11
        }
        const newChat = new Chat(chatObject);
        newChat.save((err) => {
            if(err){
                res.send({
                    success: false,
                    message: 'failed to create chat'
                })
            } else{
                res.send({
                    success: true,
                    message: 'created chat'
                });
            }
        })
    });
    app.get('/api/chat/getDesktopVisitors', (req, res) => {
        Chat.find().or([{ClientType: 0}, {ClientTytpe: 1}])
        .then(chats => {
            res.send({
                success: true,
                message: 'desktop visitors',
                results: chats
            });
        });
    });
    app.get('/api/chat/getMobileVisitors', (req, res) => {
        Chat.find().or([{ClientType: 2}, {ClientTytpe: 3}])
        .then(chats => {
            res.send({
                success: true,
                message: 'mobile visitors',
                results: chats
            });
        });
    });
    app.get('/api/chat/getVisitorCount', async (req, res) => {
        // uncomment to have an easy way of clearing db
        // await Chat.remove({}, function(e){

        // })
        try{
            const foundChat = await findChat()
            //console.log("sending response. Found operator: " + foundChat);
            res.send({
                success:true,
                message:'found chat',
                results:foundChat
            })
        } catch(e) {
            console.log("error" + e);
        }
    });

    /**
     * Find most recent chat in our database. Poll BoldChat server to see if any chats were made after most recent date. Check if chatID is already in database. Save if not. 
     */
    app.get('/api/chat/findAndSaveNewChats', async (req, res) => {
        auth = accountId + ':' + apiKeyId + ':' + (new Date()).getTime();
        authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);
        var url = 'https://api.boldchat.com/aid/706505873793485629/data/rest/json/v2/getAllChatMessages?auth=' + authHash;
        try{
            const foundChat = await findNewestChat()
            const mostRecentDate = foundChat.OriginalDate;
            request
                .get(url)
                .query({FromDate: mostRecentDate})
                .then((response) => {
                    try {
                        var jsonObject = JSON.parse(response.text);
                    } catch(e) {
                        var jsonObject = {};
                        //console.log("error: " + e);
                    }
                    if (jsonObject.Status == "success" && jsonObject.Truncated == false) {
                        if(jsonObject.Data.length >= 1){
                            return jsonObject
                        } else {
                            res.send({
                                success: true,
                                message: 'No New Chats',
                                response: jsonObject.Data
                            })
                        }
                    }
                 })
                 .then(async (data) => {
                    let newChatIDs = [];
                    let errors = []
                    await asyncForEach(data.Data, async (chat, i)=>{
                        //newChatIDs.push({ChatID:chat.ChatID, OriginalData:chat.Created})
                        let url = 'https://api.boldchat.com/aid/706505873793485629/data/rest/json/v2/getChat?auth=' + authHash;
                        await request
                            .get(url)
                            .query({ChatID: chat.ChatID})
                            .then(async (response) => {
                                try {
                                    var jsonObject = JSON.parse(response.text);
                                } catch (e) {
                                    let jsonObject = {};
                                    return null;
                                }
                                if (jsonObject.Status == "success") {
                                    let foundChat = await findChat(jsonObject.Data.ChatID); //ensure that chat isn't somehow already in db
                                    if(foundChat == null){
                                        const chatRecord = {
                                            ChatID : jsonObject.Data.ChatID,
                                            OriginalDate : chat.OriginalDate,
                                            ClientType : jsonObject.Data.ClientType,
                                            VisitorID : jsonObject.Data.VisitorID,
                                            OperatorID : jsonObject.Data.OperatorID
                                        };
                                        let newChat = new Chat(chatRecord);
                                        await newChat.Save(err => {
                                            if(err){
                                                error.push(err)
                                            } else{
                                                newChatIDs.push(chatRecord);
                                                console.log("Found and saved new chat record with ChatID " + chatRecord.ChatID);
                                            }
                                        })
                                    } else {
                                        console.log("New record found that was already in database");
                                    }
                                } // todo: implement proper error handling
                            })
                            .then(()=>{
                                res.send({
                                    success: true,
                                    message: 'saved chats',
                                    response: newChatIDs,
                                    error: errors
                                });
                            })
                            .chatch((e)=>{
                                res.send({
                                    success: false,
                                    message: 'encountered error while saving new chats',
                                    errors: e
                                })
                            })
                    });
                 })
        }catch(e) {
            console.log("error" + e);
        }
    });
}
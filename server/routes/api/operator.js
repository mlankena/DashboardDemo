const mongoose = require('mongoose');
//import models
const Operator = require('../../models/Operator');
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

const findOperator = async (operatorID) => {
    var parameter = operatorID ? {OperatorID: operatorID} : {}
    try{
        return await Operator.findOne(parameter)
    } catch(e) {
        return e;
    }
}

/**
 * Operator routes needed to save/ get information about operators
 */

module.exports = (app) => {

    /**
     * Primarily only used to initialize the db. Won't need to be as concered about the number of saves as I needed to be for messages. 
     */
    app.post('/api/operator/saveAllOperators', function(req, res){
        let results = [];
        let url = 'https://api.boldchat.com/aid/706505873793485629/data/rest/json/v2/getOperators?auth=' + authHash
        request
            .get(url)
            .then(async (response)=> {
                try {
                    let jsonObject = JSON.parse(response.text);
                    return jsonObject
                } catch(e) {
                    // todo: implement proper error handling
                    let jsonObject = {};
                }
            
            })
            .then(async (jsonObject) => {
                if (jsonObject.Status == "success" && jsonObject.Truncated == false) {
                    let responseData = jsonObject.Data;
                    let operatorsToSave = [];
                    await asyncForEach(responseData, (operator, i) => {
                        let operatorObject = {
                            OperatorID: operator.LoginID,
                            Name: operator.Name,
                            // PermissionGroupID: operator.PermissionGroupID,
                            EmailAvailable: operator.EmailService.Available,
                            FacebookAvailable: operator.FacebookService.Available,
                            TicketAvailable: operator.TicketService.Available,
                            ChatAAvailable: operator.ChatService.Available,
                            TwitterAvailable: operator.TwitterService.Available
                        }
                        operatorsToSave.push(operatorObject);
                    });
                    if(operatorsToSave.length > 0){
                        Operator.collection.insertMany(operatorsToSave, function(err){
                            if(err){
                                res.send({
                                    success: false,
                                    message: 'failed to save operators',
                                    response: err
                                });
                            } else {
                                res.send({
                                    success: true,
                                    message: 'all operators',
                                    response: jsonObject.Data
                                });
                            }
                        })
                    }
                }
            })
    });

    // check for operators that are online anywhere
    app.get('/api/operator/getOnlineOperators', (req, res) => {
        Operator.find().or([{EmailAvailable: true}, {FacebookAvailable: true},{TicketAvailable: true}, {ChatAvaialble: true}, {TwitterAvailable: true}])
        .then(operators => {
            res.send({
                success: true,
                message: 'online operators',
                results: operators
            });
        });
    });

    // primarily used for checking to see if we initialized the db
    app.get('/api/operator/getOperatorCount', async (req, res) => {
        try{
            const foundOperator = await findOperator()
            res.send({
                success:true,
                message:'found operator',
                results:foundOperator
            })
        } catch(e) {
            console.log("error" + e);
        }
    });

    /**
     * 
     * @param: operatorID
     * @param: serviceType - {
     *   1: Chat 
     *   3: Email
     *   5: Ticket
     *  10: Twitter
     * }
     */
    app.get('/api/operator/getAvailability', async (req, res) => {
        authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);
        let url = 'https://api.boldchat.com/aid/706505873793485629/data/rest/json/v2/getOperatorAvailability?auth=' + authHash
        request
            .get(url)
            .query({OperatorID:req.param('operatorID')})
            .query({ServiceTypeID:req.param('serviceType')})
            .then(response=>{
                try{
                    let jsonObject = JSON.parse(response.text);
                    //console.log(jsonObject);
                    return jsonObject
                } catch(e){

                }
            })
            .then(jsonObject => {
                res.send({
                    success: true,
                    message: 'Operator availability',
                    results: jsonObject.Data
                })
            })
    })

    /**
     * Set availability of operator through BoldChat API and save operator status in db to save switch state
     */
    app.get('/api/operator/setAvailability', async(req, res) => {
        authHash = auth + ':' + CryptoJS.SHA512(auth + apiKey).toString(CryptoJS.enc.Hex);
        let url = 'https://api.boldchat.com/aid/706505873793485629/data/rest/json/v2/setOperatorAvailability?auth=' + authHash
        request
            .get(url)
            .query({OperatorID:req.param('operatorID')})
            .query({ServiceTypeID:req.param('serviceType')})
            .query({ClientID:req.param('clientID')})
            .query({StatusType:req.param('statusType')})
            .then(response=>{
                try{
                    let jsonObject = JSON.parse(response.text);
                    return jsonObject
                } catch(e){

                }
            })
            .then(async jsonObject => {
                if(jsonObject.Status == "success"){
                    let currentOperator = {};
                    let online = req.param('statusType') == 2 ? true : false;
                    let updateField = {}
                    switch(Number(req.param('serviceType'))){
                        case 1:
                            currentOperator.ChatAvailable=online;
                            break;
                        case 3:
                            currentOperator.EmailAvailable=online;
                            break;
                        case 5:
                            currentOperator.TicketAvailable=online;
                            break;
                        case 10:
                            currentOperator.TwitterAvailable=online;
                            break;
                        default:
                    }
                    await Operator.update({OperatorID:req.param('operatorID')}, currentOperator, async (err, saved)=>{
                        if(err){
                            res.send({
                                success: false,
                                message: 'error changing',
                                results: err
                            })
                        } else{
                            res.send({
                                success: true,
                                message: 'status changed',
                                results: jsonObject.data
                            })
                        }
                    })

                } else {
                    Console.log("Something went wrong: " + jsonObject.data);
                }
            })
    })
}
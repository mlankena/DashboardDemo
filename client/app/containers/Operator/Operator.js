import React, { Component } from 'react';
import axios from 'axios'
import TSwitch from '../../components/Switch/TSwitch'
import regeneratorRuntime from "regenerator-runtime";

/**
 * Operator
 * 
 * Operator container will house all of the online operators and their switches that can toggle
 * the availability of individual operators
 */

class Operator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading:true,
            onlineOperators:[],

        }
        this.initializeDatabase = this.initializeDatabase.bind(this);
    }

    // Check if there are any operators in our database. If not, initialize the database by calling the BoldChat getOperators() api
    async componentWillMount(){
        this.setState({isLoading: true});
        const getOperatorCount = async () => {
            return await axios.get('/api/operator/getOperatorCount') // do we have at least one operator in the database?
                .then(res=>res.data)
                .then((res)=>{
                    console.log("ran " + Object.keys(res));
                    if(res.success){
                        console.log("results " + res.results);
                        return res.results
                    } else{
                        return null;
                    }
                })
                .catch((e)=>{
                    console.log("Could not get chat counts" + e);
                })
        }
        let operatorCount = await getOperatorCount();
        if(operatorCount == undefined || operatorCount == null){
            console.log("initializing db");
            await this.initializeDatabase();
        }
        await axios.get('/api/operator/getOnlineOperators') // show all operators that are online on at least one service platform
        .then(res => {
            if(res.data.success == true) {
                this.setState({
                    isLoading:false,
                    onlineOperators:res.data.results
                });
                //console.log(this.state.onlineOperators);
            }
        });
    }
    async initializeDatabase(){
        console.log("initializing db");
        await axios.post('/api/operator/saveAllOperators')
        .then(json => {
            console.log("json keys " + Object.keys(json));
            if (json.success) {
                console.log(json);
                this.setState({
                    isLoading: true
                }); 
            } else {
                this.setState({
                    isLoading: false,
                    errors: true,
                    error: json.message
                })
            }
        });
    }
    //OperatorID=4420926071001765944&ServiceTypeID=1
    render(){
        const{
            isLoading,
            onlineOperators
        } = this.state;
        // switchBuilder initializes the TSwitch components and sets their switch status based on the operators availability
        // todo: display all service type switches for each operator 
        function switchBuilder(operator) {
            let returnElements = [];
            let operatorID = operator.OperatorID;
            // this is gross. Redo this
            //console.log("In builder");
            if(operator.EmailAvailable){
                returnElements.push(<TSwitch label="Email" operator={operatorID} ServiceType="3" available={true}>Email Avaialble</TSwitch>);
            } else{
                returnElements.push(<TSwitch label="Email" operator={operatorID} ServiceType="3" available={false}>Email Avaialble</TSwitch>);
            }
            if(operator.TicketAvailable){
                returnElements.push(<TSwitch label="Ticket" operator={operatorID} ServiceType="5" available={true}>Ticket Avaialble</TSwitch>);
            }else{
                returnElements.push(<TSwitch label="Ticket" operator={operatorID} ServiceType="5" available={false}>Ticket Avaialble</TSwitch>);
            }
            if(operator.ChatAvailable){
                returnElements.push(<TSwitch label="Chat" operator={operatorID} ServiceType="1" available={true}>Chat Avaialble</TSwitch>);
            }else{
                returnElements.push(<TSwitch label="Chat" operator={operatorID} ServiceType="1" available={false}>Chat Avaialble</TSwitch>);
            }
            if(operator.TwitterAvailable){
                returnElements.push(<TSwitch label="Twitter" operator={operatorID} ServiceType="10" available={true}>Twitter Avaialble</TSwitch>);
            }else{
                returnElements.push(<TSwitch label="Twitter" operator={operatorID} ServiceType="10" available={false}>Twitter Avaialble</TSwitch>);
            }
            return returnElements;
        }
        return (
            <div> 
                <p>Operators</p>
                <ul>
                    {
                        onlineOperators.map(function(operator, i){
                            let returnElements = [];
                            let onlineElements = switchBuilder(operator);
                            //console.log(operator)
                            returnElements.push(<li>{operator.Name}</li>);
                            returnElements.push(onlineElements);
                            return returnElements
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default Operator;
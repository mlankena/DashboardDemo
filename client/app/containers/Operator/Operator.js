import React, { Component } from 'react';
import axios from 'axios'
import TSwitch from '../../components/Switch/TSwitch'
import regeneratorRuntime from "regenerator-runtime";
import {well, ListGroup, ListGroupItem, Grid, Row, Col} from 'react-bootstrap';

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
            lastUpdatedDate: Date.now(),
            lastRenderedDate: Date.now()
        }
        this.initializeDatabase = this.initializeDatabase.bind(this);
        this.updateOperators = this.updateOperators.bind(this);
    }

    // Check if there are any operators in our database. If not, initialize the database by calling the BoldChat getOperators() api
    async componentWillMount(){
        this.setState({isLoading: true});
        const getOperatorCount = async () => {
            return await axios.get('/api/operator/getOperatorCount') // do we have at least one operator in the database?
                .then(res=>res.data)
                .then((res)=>{
                    //console.log("ran " + Object.keys(res));
                    if(res.success){
                        //console.log("results " + res.results);
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
        this.setState({
            lastRenderedDate: Date.now()
        }) 
        await this.updateOperators()
        await axios.get('/api/operator/getOnlineOperators') // show all operators that are online on at least one service platform
        .then(res => {
            if(res.data.success == true) {
                this.setState({
                    isLoading:false,
                    onlineOperators:res.data.results,
                    lastUpdatedDate:Date.now()
                });
                //console.log(this.state.onlineOperators);
            }
        });
    }

    /**
     * todo: implement a "needs to update function" where I diff the online operators in the state agains the return object
     */

    componentDidMount(){
        this.timerID = setInterval(async ()=>{
            if(this.state.isLoading == false){
                await this.updateOperators();
                this.setState({
                    lastRenderedDate:Date.now()
                })
                await axios.get('/api/operator/getOnlineOperators') // show all operators that are online on at least one service platform
                .then(res => {
                    console.log(res.data.results);
                    if(res.data.success == true) {
                        this.setState({
                            isLoading:false,
                            onlineOperators:res.data.results,
                            lastUpdatedDate:Date.now()
                        });
                        //console.log(this.state.onlineOperators);
                    }
                });
            }
        }, 10000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    async updateOperators() {
        axios.post('/api/operator/updateOperators')
        .then(res => {
            //console.log(res);
        })
    }
    async initializeDatabase(){
        console.log("initializing db");
        await axios.post('/api/operator/saveAllOperators')
        .then(json => {
            if (json.success) {
                //console.log(json);
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
            onlineOperators,
            lastUpdatedDate,
            lastRenderedDate
        } = this.state;
        // switchBuilder initializes the TSwitch components and sets their switch status based on the operators availability
        // todo: display all service type switches for each operator 
        function switchBuilder(operator) {
            let returnElements = [];
            let operatorID = operator.OperatorID;
            // this is gross. Redo this
            //console.log("In builder");
            if(operator.EmailAvailable){
                returnElements.push(<TSwitch label="Email" operator={operatorID} ServiceType="3" available={true} updatedDate={lastUpdatedDate}>Email Avaialble</TSwitch>);
            } else{
                returnElements.push(<TSwitch label="Email" operator={operatorID} ServiceType="3" available={false} updatedDate={lastUpdatedDate}>Email Avaialble</TSwitch>);
            }
            if(operator.TicketAvailable){
                returnElements.push(<TSwitch label="Ticket" operator={operatorID} ServiceType="5" available={true} updatedDate={lastUpdatedDate}>Ticket Avaialble</TSwitch>);
            }else{
                returnElements.push(<TSwitch label="Ticket" operator={operatorID} ServiceType="5" available={false} updatedDate={lastUpdatedDate}>Ticket Avaialble</TSwitch>);
            }
            if(operator.ChatAvailable){
                returnElements.push(<TSwitch label="Chat" operator={operatorID} ServiceType="1" available={true} updatedDate={lastUpdatedDate}>Chat Avaialble</TSwitch>);
            }else{
                returnElements.push(<TSwitch label="Chat" operator={operatorID} ServiceType="1" available={false} updatedDate={lastUpdatedDate}>Chat Avaialble</TSwitch>);
            }
            if(operator.TwitterAvailable){
                returnElements.push(<TSwitch label="Twitter" operator={operatorID} ServiceType="10" available={true} updatedDate={lastUpdatedDate}>Twitter Avaialble</TSwitch>);
            }else{
                returnElements.push(<TSwitch label="Twitter" operator={operatorID} ServiceType="10" available={false} updatedDate={lastUpdatedDate}>Twitter Avaialble</TSwitch>);
            }
            return returnElements;
        }
        if(lastRenderedDate == null || lastRenderedDate < lastUpdatedDate){
            return (
                <div className="well">
                <div> 
                    <h3>Operators</h3>
                    <Grid>
                    <ListGroup xsoffset={1}>
                        {
                            onlineOperators.map(function(operator, i){
                                let returnElements = [];
                                let onlineElements = switchBuilder(operator);
                                //console.log(operator)

                                returnElements.push(<ListGroupItem>{operator.Name}</ListGroupItem>);
                                returnElements.push(onlineElements);
                                <br />
                                return returnElements
                            })
                        }
                    </ListGroup>
                    </Grid>
                </div>
                </div>
            )
        } else {
            return (
                <div className="well">
                <div> 
                    <h3>Operators</h3>
                </div>
                </div>
            )
        }
    }
}

export default Operator;
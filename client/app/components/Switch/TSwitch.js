// https://www.npmjs.com/package/react-switch
import React, { Component } from 'react';
import Switch from "react-switch";
import axios from 'axios'
import regeneratorRuntime from "regenerator-runtime";

/**
 * TSwitch (Toggle Switch)
 * 
 * This component will dispaly as a switch in the DOM on the Operators page. The component handles
 * switching the operator's availability for individual services
 */

class TSwitch extends React.Component {

    constructor ( props ) {
        super( props );
        console.log("props available: " + props.available);
		this.state = {
            checked: props.available
        }
        this.getAvailability = this.getAvailability.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
	
	// componentWillMount () {
	// 	this.setState( { isChecked: this.props.isChecked } );
	// }

    
    async handleChange(checked) {
        //console.log("Checked: " + this.state.checked)
        const availabilityResponse = await this.getAvailability();
        //console.log("Availability: " + JSON.stringify(availabilityResponse));
        const checkAvailability = async () =>{
            if(availabilityResponse.success && availabilityResponse.results != undefined && availabilityResponse.results.length == 1){
                const clientID = availabilityResponse.results[0].ClientID;
                const serviceTypeID = availabilityResponse.results[0].ServiceTypeID;
                const statusType = availabilityResponse.results[0].StatusType;
                const operatorID = availabilityResponse.results[0].LoginID;
                //console.log(statusType);
                switch(statusType){
                    case 1:
                        // change to online
                        //console.log("Sending " + operatorID);
                        return await axios.get('/api/operator/setAvailability', {
                            params: {
                                operatorID: operatorID,
                                serviceType: serviceTypeID,
                                clientID: clientID,
                                statusType: 2
                            }
                        })
                        .then(json => {
                            console.log("Switched to online " + json);
                        })
                        break;
                    case 2: 
                        //console.log("in proper switch");
                        return await axios.get('/api/operator/setAvailability', {
                            params: {
                                operatorID: operatorID,
                                serviceType: serviceTypeID,
                                clientID: clientID,
                                statusType: 1
                            }
                        })
                        .then(json => {
                            console.log("Switched to offline " + json);
                        })
                        // change to away
                        break;
                    default:
                        console.log("ERROR HAPPENED IN HANDLE CHANGE");
                        // throw error
                }
            }
        }
        await checkAvailability();
        this.setState({ checked });
    }

    // get status type from service
    // 0 == offline
    // 2 == online
    getAvailability() {
        let operatorID = this.props.operator;
        let ServiceType = this.props.ServiceType;
        return axios.get('/api/operator/getAvailability', {
            params: {
                operatorID: operatorID,
                serviceType: ServiceType
            }
        })
        .then(json => {
            //todo: error handling
            //console.log(json);
            return json.data
        })
    }
    
    render() {
        return (
          <label htmlFor="normal-switch">
          <div>
            <span>{this.props.label}</span>
            </div>
            <div>
            <Switch
              onChange={this.handleChange}
              checked={this.state.checked}
              id="normal-switch"
            />
            </div>
          </label>
        );
      }

}

export default TSwitch;
 
//React.render( <Switch isChecked={ true } />)
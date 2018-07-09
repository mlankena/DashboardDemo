// https://github.com/jerairrest/react-chartjs-2
import React, {Component} from 'react'
import {Bar, Line, Pie} from 'react-chartjs-2';
const ViewInfo = (props) => {
    // this.state= {
    //     desktopUserCount: props.desktopUsers.length,
    //     mobileUserCount: props.mobileUsers.length
    // }
    let chartData = {
        chartData:{
            labels: ['Visitor Count'],
            datasets: [{
                label:'Desktop Visitor Count',
                data:[props.desktopUsers.length],
                backgroundColor:[
                    'rgba(49,154,229, 0.6)',
                ]
            }, {
                label:'Mobile Visitor Count',
                data:[props.mobileUsers.length],
                backgroundColor:[
                    'rgba(229, 124, 49, 0.6)'
                ]
            }]
        }
    }
    //console.log("Here are the desktopUsers " + props.desktopUsers.length);
    //console.log("Here are the mobileUsers " + props.mobileUsers.length);
    return (
        <div className='chart'>
        <Bar
            data={chartData.chartData}
            options={{
                maintainAspectRatio: false
            }}
        />
        </div>
    )
};

export default ViewInfo;
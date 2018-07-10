import React, { Component } from 'react';
import axios from 'axios'
import ViewInfo from '../../components/Profile/ViewInfo'
import regeneratorRuntime from "regenerator-runtime";

class Profile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            error: '',
            desktopUsers: [],
            mobileUsers: [],
            lastUpdated: null
        };
        this.initializeDatabase = this.initializeDatabase.bind(this);
    }

    async componentWillMount() {
        this.setState({isLoading: true});
        const getChatCount = async () => {
            return await axios.get('/api/chat/getVisitorCount')
                .then(res=>res.data)
                .then((res)=>{
                    if(res.success){
                        return res.results
                    } else{
                        return 0;
                    }
                })
                .catch((e)=>{
                    console.log("Could not get chat counts" + e);
                })
        }
        let chatCount = await getChatCount();
        if(chatCount == 0 || chatCount == null){
            await this.initializeDatabase();
        } else {
            axios.get('/api/chat/getDesktopVisitors')
            .then(res => {
                if(res.data.success == true) {
                    this.setState({
                        isLoading:false,
                        desktopUsers:res.data.results,
                        lastUpdated:Date.now()
                    });
                    //console.log(this.state.desktopUsers);
                }
            });
            axios.get('/api/chat/getMobileVisitors')
            .then(res => {
                if(res.data.success == true) {
                    this.setState({
                        isLoading:false,
                        mobileUsers:res.data.results,
                        lastUpdated:Date.now()
                    });
                   // console.log(this.state.mobileUsers);
                }
            });
        }   
    }

    componentDidMount(){
        this.timerID = setInterval(()=>{
            if(this.state.isLoading == false){
                this.updateChatRecords();
            }
        }, 60000);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    async updateChatRecords(){
        await axios.get('/api/chat/findAndSaveNewChats')
        .then(res => {
            if(res.data.response.length > 0){
                axios.get('/api/chat/getDesktopVisitors')
                .then(res => {
                    if(res.data.success == true) {
                        this.setState({
                            isLoading:false,
                            mobileUsers:res.data.results,
                            lastUpdated:Date.now()
                        });
                        //console.log(this.state.desktopUsers);
                    }
                });
                axios.get('/api/chat/getMobileVisitors')
                .then(res => {
                    if(res.data.success == true) {
                        this.setState({
                            isLoading:false,
                            mobileUsers:res.data.results,
                            lastUpdated:Date.now()
                        });
                        //console.log(this.state.mobileUsers);
                    }
                });
            }
        })
        axios.get('/api/chat/getDesktopVisitors')
        .then(res => {
            if(res.data.success == true) {
                this.setState({
                    isLoading:false,
                    mobileUsers:res.data.results,
                    lastUpdated:Date.now()
                });
                //console.log(this.state.desktopUsers);
            }
        });
        axios.get('/api/chat/getMobileVisitors')
        .then(res => {
            if(res.data.success == true) {
                this.setState({
                    isLoading:false,
                    mobileUsers:res.data.results,
                    lastUpdated:Date.now()
                });
                //console.log(this.state.mobileUsers);
            }
        });
    }
    async initializeDatabase() {
        await axios.post('/api/chat/getAllChatMessages')
            .then(res => res.data)            
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
        console.log(`Got chat messages, now saving`);
        await axios.post('/api/chat/saveAllChatInfo')
            .then(res => {
                res.data
            })
            .then(() => {
                axios.get('/api/chat/getDesktopVisitors')
                .then(res => {
                    if(res.data.success == true) {
                        this.setState({
                            isLoading:false,
                            desktopUsers:res.data.results
                        });
                        //console.log(this.state.desktopUsers);
                    }
                });
            })
            .then(() => {
                axios.get('/api/chat/getMobileVisitors')
                .then(res => {
                    if(res.data.success == true) {
                        this.setState({
                            isLoading:false,
                            mobileUsers:res.data.results
                        });
                        //console.log(this.state.mobileUsers);
                    }
                });
            })
    }
    render() {
        const {
            error,
            isLoading,
            desktopUsers,
            mobileUsers
        } = this.state;
        if(isLoading) {
            return (
                <div>
                    <p>Loading...</p>
                </div>
            )
        }
        if(error) {
            return (
                <div>
                    <p>Error</p>
                </div>
            )
        }
        return (
            <div>
                <p>Profile</p>
                {
                   <ViewInfo desktopUsers={desktopUsers} mobileUsers={mobileUsers}/>
                }
            </div>
        );
    }
}

export default Profile;
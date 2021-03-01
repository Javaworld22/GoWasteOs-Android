import React, { Component } from 'react'
import { Text,TextInput, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle'
import styles from './style'
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import { NavigationEvents } from 'react-navigation';
import moment from "moment";
import io from 'socket.io-client';
import store from "../../components/redux/store/index";
const SERVER = "http://111.93.169.90:8044/";


export default class Message extends Component {
    constructor(props){
        super(props);
        this.msgScrollViewRef = React.createRef();
        this.state = {
            messageGroupList: {},
            showLoader: false,
            pageno: 1,
            isScroll:false,
            userType:"",

            chatUserIdArr: Array(),
            senderLoginId: store.getState().userDetails.id,
            senderChatId:'',
            receiverLoginId:'',
            receiverChatId:'',
            receiverDetails: {},
            message:"",
            messageList: Array(),
            showUserList:false,
            showMsgList:false,
          };   
    }

    componentDidMount = async() => {
        this.configureSocket();          
        this.focusNavigation();
    };

    getChatUserList=async()=>{
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        if(this.state.isScroll==true){
            formData.append('pageno', this.state.pageno+1);
        }else{
            formData.append('pageno', this.state.pageno);
        } 
        this.setState({ showLoader: true });
        let response = await POST(endPoints.messagesGroups, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});

        //For normal load
        if (response && this.state.isScroll==false && response.details.ack == '1') {
            this.setState({messageGroupList: response.details.chatGroups});
        } 
        //For scroll
        if (response && this.state.isScroll==true && response.details.ack == '1') {
            const object1 = this.state.messageGroupList;             
            const object2 = response.details.chatGroups;             
            const object3 = [...object1, ...object2];         
            this.setState({messageGroupList: object3});
            this.setState({isScroll: false});
            this.setState({pageno: this.state.pageno+1});
        } 
    }

    getMessageList=async()=>{
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        if(this.state.isScroll==true){
            formData.append('pageno', this.state.pageno+1);
        }else{
            formData.append('pageno', this.state.pageno);
        } 
        formData.append('to_id', this.state.receiverLoginId);
        this.setState({ showLoader: true });
        let response = await POST(endPoints.messages, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});

        //For normal load
        if (response && this.state.isScroll==false && response.details.ack == '1') {
            this.setState({messageList: response.details.messages.reverse()});
        } 
        // //For scroll
        if (response && this.state.isScroll==true && response.details.ack == '1') {
            const objects1 = this.state.messageList;             
            const objects2 = response.details.messages.reverse();             
            const objects3 = [...objects2, ...objects1];         
            this.setState({messageList: objects3});
            this.setState({isScroll: false});
            this.setState({pageno: this.state.pageno+1});
        } 
    }

    getReceiverDetails=async(userid)=>{
        let formData = new FormData();
        formData.append('user_id', userid);
        
        let response = await POST(endPoints.profileDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        
        if (response && response.ack && response.ack == 1) {
           this.setState({ receiverDetails: response.details });
        } else {
            // console.log("Error in 'profileDetails' api");
        }
    }

    userScrollPagination=()=>{
        this.setState({isScroll: true});
        this.getChatUserList();  
    }

    msgScrollPagination=()=>{
        this.setState({isScroll: true});
        this.getMessageList();  
    }

    configureSocket = async() => {

        var socket = io(SERVER);
        
        socket.on('connect', () => {
            let userInfo = {
                id:  socket.id,
                loginid: this.state.senderLoginId
            }
            
            this.setState({senderChatId:socket.id});
            socket.emit('login', userInfo);
        })

        socket.on('userList', (userList) => {
            var id = socket.id;
            this.setState({chatUserIdArr:userList});
            if(this.state.chatUserIdArr.length>0){
                let filteruserArr = this.state.chatUserIdArr.filter(item => item.id != id)
                this.setState({chatUserIdArr:filteruserArr});
            }
        })

        socket.on('receiveMsg', data => {
            let prevmsg = this.state.messageList;
            if (data.senderLogid === this.state.senderLogid) {
                
            } else {
                prevmsg.push(data);
                this.setState({messageList:prevmsg});
            }
        })

        socket.on('quit', (id) => {
            if(this.state.chatUserIdArr.length>0){
                let filteruserArr = this.state.chatUserIdArr.filter(item => item.id != id)
                this.setState({chatUserIdArr:filteruserArr});
            }
        })

        this.socket = socket;
       
    }

    openMessageBox = (loginid) => {
        var resuserArr = Array();
        if(this.state.chatUserIdArr.length>0){
            resuserArr = this.state.chatUserIdArr.filter(item => item.loginid == loginid);
        }

        if(resuserArr.length>0){
            this.setState({
                receiverLoginId:loginid,
                receiverChatId:resuserArr[0].id,
                showUserList:false,
                showMsgList:true,
                pageno:1,
            });
        } else {
            this.setState({
                receiverLoginId:loginid,
                receiverChatId:'',
                showUserList:false,
                showMsgList:true,
                pageno:1,
            });
        }
        this.getMessageList();
        this.getReceiverDetails(loginid);
        // console.log('receivid',resuserArr);
    }

    openUserBox = () => {

        this.setState({
            receiverLoginId:'',
            receiverChatId:'',
            showUserList:true,
            showMsgList:false,
            pageno:1,
            messageList: Array(),
        },
        ()=>{
            this.getChatUserList(); 
        });
    }

    sendMessage = () => {
        if(this.state.message!=""){
            let info = {
                sendId: this.state.senderChatId, 
                id: this.state.receiverChatId, 
                senderLogid: this.state.senderLoginId, 
                receiverLogid: this.state.receiverLoginId, 
                message: this.state.message,
                createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            }
            this.saveMsgDatabase();
            console.log(info);
            let prevmsg = this.state.messageList;
            prevmsg.push(info);
            this.setState({messageList:prevmsg});
            
            this.socket.emit('sendMsg', info);
        }
    }

    saveMsgDatabase = async() => {
        if(this.state.message!=""){
            let formData = new FormData();
            formData.append('message', this.state.message);
            formData.append('to_id', this.state.receiverLoginId);
            formData.append('from_id', this.state.senderLoginId);
            formData.append('created_date', moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
            
            let response = await POST(endPoints.sendMessages, formData, {
                Authorization: await Retrieve("userToken")
            });

            this.setState({message: ""});
        }
    }

    focusNavigation = () => {
        // console.log('newChatId',this.props.navigation.state.params.to_id);
        if(this.props.navigation.state.params.to_id!==''){
            this.setState({
                showUserList: false,
                showMsgList: true
            });
            this.openMessageBox(this.props.navigation.state.params.to_id);
        } else {
            this.setState({
                showUserList: true,
                showMsgList: false
            });
            this.getChatUserList();
        }
    }


    render() {
        
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                { this.state.showUserList &&
                    <Header 
                        {...this.props}
                        pageType="homeDetails"
                        label="Messages"
                    />
                }
                { this.state.showMsgList &&
                    <View style={style.hnavigation}>
                        <TouchableOpacity style={style.iconback} onPress={() => this.openUserBox()}>
                            <Icon name="md-arrow-back" color="#fb6400" size={30} />
                        </TouchableOpacity>
                        <View style={style.avatar}>
                            { this.state.receiverDetails.profilePicture!==''?
                            <Image 
                                source={{uri: this.state.receiverDetails.profilePicture && this.state.receiverDetails.profilePicture.includes("https://") ? this.state.receiverDetails.profilePicture : dynamicImageURL + "/" + this.state.receiverDetails.profilePicture}} 
                                style={styles.senderavtimg} 
                            />
                            : 
                            <Image 
                                source={{uri: dynamicImageURL + "/img/no-image.jpg"}}
                                style={styles.senderavtimg} 
                            />
                            }
                        </View>
                        <View style={{paddingRight:'5%',paddingLeft:10,position:'relative'}}>
                            <Text style={style.navh}>{this.state.receiverDetails.firstName}</Text>
                        </View>
                    </View>
                }
                <Loader 
                    loading={this.state.showLoader} 
                />

                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({pageno:1},
                            ()=>{
                                this.focusNavigation()
                            })
                    }
                />

                { this.state.showUserList &&
                <ScrollView 
                    onScrollEndDrag={this.userScrollPagination}
                >     
                    <View style={style.container}>
                    
                        {this.state.messageGroupList && this.state.messageGroupList.length > 0 ? this.state.messageGroupList.map((item, index) => {
                            var date=item.createdDateTime.split(" ")[0];
                            var time=item.createdDateTime.split(" ")[1];
                            var today = new Date();
                            var dd = String(today.getDate()).padStart(2, '0');
                            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                            var yyyy = today.getFullYear();
                            today = yyyy+'-'+mm + '-' + dd ;
                            var dateTime="";
                            if(today==date){
                                dateTime=moment.utc(time, "HH:mm:ss").format('hh:mm A');
                            }else{
                                dateTime=dd+'/'+mm + '/' + yyyy;
                            }

                            // var matchReceiverArr = Array();
                            // var matchReceiverChatId = '';
                            // if(this.state.chatUserIdArr.length>0){
                            //     matchReceiverArr = this.state.chatUserIdArr.filter(item => item.loginid == item.other_user_id);
                            // }
                    
                            // if(matchReceiverArr.length>0){
                            //     matchReceiverChatId = matchReceiverArr[0].id
                            // }

                            return (
                                <TouchableOpacity style={styles.chatbox} 
                                    onPress={() => this.openMessageBox(item.other_user_id)}
                                    key={index}
                                >
                                    <View style={style.avtbox}>
                                        <View style={style.avatar}>
                                            <Image 
                                                source={{ uri: item.other_user_profilePicture }}  
                                                style={styles.senderavtimg} 
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.centercontent}>
                                        <Text style={style.headingmain} numberOfLines={1} >{item.other_user_name}</Text>                               
                                        <Text style={style.msgtext} numberOfLines={1}>{item.message}</Text>
                                    </View>
                                    <View style={style.colicon}>
                                    <Text style={styles.datetext}> {dateTime}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                        :<Text>No user found.</Text>}

                    </View>
                </ScrollView>
                }

                {this.state.showMsgList && 
                <View style={{flex: 1}}>
                    <ScrollView
                        ref={this.msgScrollViewRef}
                        onContentSizeChange={() => this.msgScrollViewRef.current.scrollToEnd({ animated: true })}
                        onScrollBeginDrag={this.msgScrollPagination}
                    >     
                        <View  style={[style.container],{paddingBottom:70,paddingLeft:10,paddingRight:10}}>

                        {this.state.messageList && this.state.messageList.length > 0 ? this.state.messageList.map((msgitem, index) => {
                            var msgdate=msgitem.createdDate.split(" ")[0];
                            var msgtime=msgitem.createdDate.split(" ")[1];
                            var msgtoday = new Date();
                            var msgdd = String(msgtoday.getDate()).padStart(2, '0');
                            var msgmm = String(msgtoday.getMonth() + 1).padStart(2, '0');
                            var msgyyyy = msgtoday.getFullYear();
                            msgtoday = msgyyyy+'-'+msgmm + '-' + msgdd ;
                            var msgdateTime="";
                            if(msgtoday==msgdate){
                                msgdateTime=moment.utc(msgtime, "HH:mm:ss").format('hh:mm A');
                            }else{
                                msgdateTime=msgdd+'/'+msgmm + '/' + msgyyyy+', '+moment(msgtime, "HH:mm:ss").format('hh:mm A');
                            }
                        return (
                            
                            <View key={index}>
                                {msgitem.senderLogid==this.state.receiverLoginId?
                                    <View style={styles.receivebox}>
                                        <View style={style.avtbox}>
                                            <View style={style.avatar}>
                                                { this.state.receiverDetails.profilePicture!==''?
                                                <Image 
                                                    source={{uri: this.state.receiverDetails.profilePicture && this.state.receiverDetails.profilePicture.includes("https://") ? this.state.receiverDetails.profilePicture : dynamicImageURL + "/" + this.state.receiverDetails.profilePicture}} 
                                                    style={styles.senderavtimg} 
                                                />
                                                : 
                                                <Image 
                                                    source={{uri: dynamicImageURL + "/img/no-image.jpg"}}
                                                    style={styles.senderavtimg} 
                                                />
                                                }
                                            </View>
                                        </View>
                                        <View style={styles.receivecontent}>
                                            <View style={{backgroundColor:'#4ba9df',borderRadius:15,}}>
                                                <Text style={{color:'white',padding:7}}> {msgitem.message} </Text>
                                            </View>
                                            <Text style={styles.datetext}>{msgdateTime}</Text>
                                        </View>
                                    </View>
                                :
                                    <View style={styles.sendbox}>                                
                                        <View style={styles.sendcontent}>
                                            <View style={{backgroundColor:'#00a4ff',borderRadius:15,}}>
                                                <Text style={{color:'white',padding:7}}> {msgitem.message}</Text>
                                            </View>
                                            <Text style={styles.datetext}>{msgdateTime}</Text>
                                        </View>
                                        <View style={style.avtbox}>
                                            <View style={style.avatar}>
                                                { store.getState().userDetails.profilePicture!==''?
                                                <Image 
                                                    source={{uri: store.getState().userDetails.profilePicture && store.getState().userDetails.profilePicture.includes("https://") ? store.getState().userDetails.profilePicture : dynamicImageURL + "/" + store.getState().userDetails.profilePicture}} 
                                                    style={styles.senderavtimg} 
                                                />
                                                : 
                                                <Image 
                                                    source={{uri: dynamicImageURL + "/img/no-image.jpg"}}
                                                    style={style.senderavtimg} 
                                                />
                                                }
                                            </View>
                                        </View>                                
                                    </View>
                            }
                            </View>
                            );
                        }):null}

                        </View>   
                    </ScrollView>

                    <View style={styles.bottomSendBox}>
                        <View style={styles.chatinputBox}>
                            <TextInput 
                                placeholder="Enter some text ...." 
                                placeholderTextColor="#acacac" 
                                style={style.formControlInput}
                                onChangeText={text =>this.setState({ message: text })}
                                value={this.state.message}
                            />
                        </View>
                        <TouchableOpacity style={{paddingLeft:10,paddingTop:15}} onPress={() => this.sendMessage()} >
                            <Icon name="send" size={25} color="#fb6400"/>
                        </TouchableOpacity>  
                    </View>

                </View>
                }

            </SafeAreaView>
        )
    }
}

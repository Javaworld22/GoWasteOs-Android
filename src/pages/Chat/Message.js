import React, { Component } from 'react'
import { Text,TextInput, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, Alert, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle'
import styles from './style'
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST,SOCKETSERVER} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import { NavigationEvents } from 'react-navigation';
import moment from "moment";
import io from 'socket.io-client';
import store from "../../components/redux/store/index";

import PushNotification from "react-native-push-notification";
import {senderIdFirebase} from '../../components/Api';


export default class Message extends Component {
    constructor(props){
        super(props);
        this.animatedValue = new Animated.Value(-70)
        this.msgScrollViewRef = React.createRef();
        this.state = {
            messageGroupList: {},
            showLoader: false,
            pageno: 1,
            isScroll:false,
            showOlderMsg: 0,
            scrollToEnd: true,
            userType:"",

            chatUserIdArr: Array(),
            senderLoginId: store.getState().userDetails.id,
            senderChatId:'',
            receiverLoginId:this.props.navigation.state.params.to_id,
            receiverChatId:'',
            receiverDetails: {},
            message:"",
            messageList: Array(),

            notificationReceived: false,
            notiMessage:"",
            notiTitle:"",
          };   
    }

    componentDidMount = async() => {
        this.setState({messageList:Array()});
        this.configureSocket();          
        this.getMessageList(this.props.navigation.state.params.to_id);
        this.changeUnreadStatus(this.props.navigation.state.params.to_id);
        this.getReceiverDetails(this.props.navigation.state.params.to_id);
        const fun = async () => {
            PushNotification.configure({
                // (optional) Called when Token is generated (iOS and Android)
                onRegister: (token)=> {
                   console.log(token.token)
                },
                
                onNotification: (notification) => {
                    this.updateNoti(notification.title, notification.message)
                    if(notification.foreground==true){
                        this.callToast()
                        console.log("NOTIFICATION:", notification);
                    }else{
                        console.log("NOTIFICATION:", notification);
                    }
                // required on iOS only 
                //notification.finish(PushNotificationIOS.FetchResult.NoData);
                },
        
        
                // Android only
                senderID: senderIdFirebase,
                // iOS only
                permissions: {
                    alert: true,
                    badge: true,
                    sound: true
                },
                popInitialNotification: true,
                requestPermissions: true
                });
        };  
        fun();
        this.props.navigation.addListener('didFocus', () => {
            fun();
        });
    };

    updateNoti=(title, message)=>{
        this.setState({notiTitle: title, notiMessage:message})
    }

    callToast=()=> {
        this.setState({notificationReceived: true})
        Animated.timing(
          this.animatedValue,
          { 
            toValue: 0,
            duration: 350,
            useNativeDriver:true
          }).start(this.closeToast())
      }
      
      closeToast=()=>{
        setTimeout(() => {
          Animated.timing(
          this.animatedValue,
          { 
            toValue: -70,
            duration: 350,
            useNativeDriver:true
          }).start(this.setState({notificationReceived: false}))
        }, 1000)
      }

    getMessageList = async(receiverid) => {
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        formData.append('pageno', this.state.pageno); 
        formData.append('to_id', receiverid);

        this.setState({ showLoader: true });
        let response = await POST(endPoints.messages, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        // console.log(response);
        //For normal load
        if (response && this.state.isScroll==false && response.details.ack == '1') {
            
            this.setState({showOlderMsg:response.details.oldMsg});
            this.setState({messageList: response.details.messages.reverse()});
        } 
        
    }

    getReceiverDetails= async(receiverid) => {
        let formData = new FormData();
        formData.append('user_id', receiverid);
        
        let response = await POST(endPoints.profileDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        
        if (response && response.ack && response.ack == 1) {
           this.setState({ receiverDetails: response.details });
        } else {
            // console.log("Error in 'profileDetails' api");
        }
    }

    changeUnreadStatus= async(receiverid) => {
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        formData.append('to_id', receiverid);
        console.log(formData);
        let response = await POST(endPoints.updateMsgReadStatus, formData, {
            Authorization: await Retrieve("userToken")
        });
    }

    saveMsgDatabase = async(currentmsg) => {
        if(this.state.message!=""){
            let formData = new FormData();
            formData.append('message', currentmsg);
            formData.append('to_id', this.state.receiverLoginId);
            formData.append('from_id', this.state.senderLoginId);
            formData.append('created_date', moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
            
            let response = await POST(endPoints.sendMessages, formData, {
                Authorization: await Retrieve("userToken")
            });
        }
    }

    msgScrollPagination=()=>{
        this.setState({isScroll: true});
        this.getMessageList(this.state.receiverLoginId);  
    }

    configureSocket = async() => {

        var socket = io(SOCKETSERVER);
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
                // let filteruserArr = this.state.chatUserIdArr.filter(item => item.loginid != this.state.senderLoginId)
                this.setState({chatUserIdArr:filteruserArr});
            }
        })

        socket.on('receiveMsg', data => {
            // console.log(data, "rcvmsg")
            let prevmsg = this.state.messageList;
            if (data.senderLogid === this.state.senderLoginId) {
                
            } else {
                
                if(data.senderLogid == this.state.receiverLoginId){
                    prevmsg.push(data);
                    this.setState({messageList:prevmsg});
                }
            }
        })

        socket.on('quit', (id) => {
            if(this.state.chatUserIdArr.length>0){
                let filteruserArr = this.state.chatUserIdArr.filter(item => item.id != id)
                // let filteruserArr = this.state.chatUserIdArr.filter(item => item.loginid != this.state.senderLoginId)
                this.setState({chatUserIdArr:filteruserArr});
            }
        })

        this.socket = socket;
       
    }

    sendMessage = () => {
        if(this.state.message!=""){
        
            var resuserArr = Array();
            if(this.state.chatUserIdArr.length>0){
                resuserArr = this.state.chatUserIdArr.filter(item => item.loginid == this.state.receiverLoginId);
            }
            if(resuserArr.length>0){
                var info = {
                    sendId: this.state.senderChatId, 
                    id: resuserArr[0].id, 
                    senderLogid: this.state.senderLoginId, 
                    receiverLogid: this.state.receiverLoginId, 
                    message: this.state.message,
                    createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                }

            } else {
                var info = {
                    sendId: this.state.senderChatId, 
                    id: '', 
                    senderLogid: this.state.senderLoginId, 
                    receiverLogid: this.state.receiverLoginId, 
                    message: this.state.message,
                    createdDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                }
            }

            
            // console.log(info);
            let currentmsg = this.state.message;
            let prevmsg = this.state.messageList;
            prevmsg.push(info);
            this.setState({
                messageList:prevmsg,
                message: "",
                scrollToEnd: true,
            });
            
            this.socket.emit('sendMsg', info);
            this.saveMsgDatabase(currentmsg);
        } else {
            Alert.alert("", "Please enter some text.", [
                { text: "Ok"}
            ]);
        }
    }

    loadOlderMessage = async() => {
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        formData.append('pageno', this.state.pageno+1); 
        formData.append('to_id', this.props.navigation.state.params.to_id);

        // this.setState({ showLoader: true });
        let response = await POST(endPoints.messages, formData, {
            Authorization: await Retrieve("userToken")
        });
        // this.setState({showLoader: false});
        // console.log(response);
        //For normal load
        if (response && this.state.isScroll==false && response.details.ack == '1') {
            const object1 = this.state.messageList;             
            const object2 = response.details.messages.reverse();             
            const object3 = [...object2, ...object1];         
            this.setState({messageList: object3});
            this.setState({
                scrollToEnd: false,
                pageno: this.state.pageno+1
            });

            this.setState({showOlderMsg:response.details.oldMsg});
        } 
    }

    render() {
        
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />

                {this.state.notificationReceived==true?
                <View style={{height: 50, backgroundColor: '#1cae81', position: 'relative', zIndex: 100, left:0, top:0,width:"100%"}}>
                    <Animated.View  style={{ transform: [{ translateY: this.animatedValue }], height: 70, backgroundColor: '#1cae81', justifyContent:  'center' }}>
                        <Text style={{ marginLeft: 16,  color: 'white',  fontSize:16, fontWeight: 'bold' }}>
                        {this.state.notiTitle}
                        </Text>
                        <Text style={{ marginLeft: 16,  color: 'white',  fontSize:12, fontWeight: 'bold' }}>
                        {this.state.notiMessage}
                        </Text>
                    </Animated.View>
                </View>
                :
                
                
                <View style={style.hnavigation}>
                    <TouchableOpacity style={style.iconback} onPress={() => this.props.navigation.goBack()}>
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
                </View>}
                
                <Loader 
                    loading={this.state.showLoader} 
                />

                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({
                            pageno:1,
                            messageList:Array(),
                        },
                            ()=>{
                                this.getMessageList(this.props.navigation.state.params.to_id);
                                this.getReceiverDetails(this.props.navigation.state.params.to_id);
                            })
                    }
                />

                <View style={{flex: 1}}>
                    <ScrollView
                        ref={this.msgScrollViewRef}
                        onContentSizeChange={() => {
                            this.state.scrollToEnd === true?this.msgScrollViewRef.current.scrollToEnd({ animated: true }):"";
                        }}

                    >     
                        <View  style={[style.container],{paddingBottom:70,paddingLeft:10,paddingRight:10}}>

                        {this.state.showOlderMsg === 1 ?    
                            <View style={{alignItems:'center',}}>
                                <TouchableOpacity 
                                    style={{width:"40%",alignItems:'center',borderRadius:25,
                                    paddingHorizontal:8,paddingVertical:8,borderColor:'black',borderWidth:1}} 
                                    onPress={() => this.loadOlderMessage()} 
                                >
                                    <Text>Older Messages</Text>
                                </TouchableOpacity>
                            </View>
                        :<></>}

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
                                msgdateTime=moment(msgdate).format('MMMM Do YYYY')+', '+moment(msgtime, "HH:mm:ss").format('hh:mm A');
                            }
                        return (
                            
                            <View key={index}>
                                {msgitem.senderLogid==this.state.senderLoginId?

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
                                :
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
                                multiline={true}
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

            </SafeAreaView>
        )
    }
}

import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView, Platform, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import PushNotification from "react-native-push-notification";
import {senderIdFirebase} from '../Api';
import store from "../redux/store/index";
import {dynamicImageURL,endPoints, POST} from '../Api';
import {Store, Retrieve, Remove} from '../AsyncStorage';

export default class Header extends Component {
    constructor(props) {
        super(props)
        this.animatedValue = new Animated.Value(-70)
        this.state = {
            notificationReceived: false,
            deviceToken: "",
            deviceType: "",
            notiMessage:"",
            notiTitle:"",
            label:"",
          };
    }

    componentDidMount(){
        
        const fun = async () => {
            PushNotification.configure({
                // (optional) Called when Token is generated (iOS and Android)
                onRegister: (token)=> {
                    this.updateState(token.token)
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
    }


    updateNoti=(title, message)=>{
        this.setState({notiTitle: title, notiMessage:message})
    }
    updateState=(token)=>{
        this.setState({deviceToken: token, deviceType:Platform.OS})
        if(store.getState().userDetails.device_token!=token){
            this.updateToken()
        }
    }
    updateToken=async()=>{
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        formData.append('device_token', this.state.deviceToken);
        formData.append('device_type', this.state.deviceType);
        
        let response = await POST(endPoints.updateProfile, formData, {
            Authorization: await Retrieve("userToken")
        });
        if (response.ack == 1) {
            // console.log(response);
        } else {
            // console.log("Error in api");
        }

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
        }, 2000)
      }

    // componentDidUpdate(props) {
    //     const { label} = this.props;
    //     if (props.label !== label) {
    //         this.forceUpdate();
    //     }
    // }

    render() {
        return (
            <>
            {this.state.notificationReceived==true?
            // <View style={{height: 50, backgroundColor: '#1cae81', position: 'relative', zIndex: 100, left:0, top:0,width:"100%"}}>
            //     <Animated.View  style={{ transform: [{ translateY: this.animatedValue }], height: 70, backgroundColor: '#1cae81', justifyContent:  'center' }}>
            //         <Text style={{ marginLeft: 16,  color: 'white',  fontSize:16, fontWeight: 'bold' }}>
            //         {this.state.notiTitle}
            //         </Text>
            //         <Text style={{ marginLeft: 16,  color: 'white',  fontSize:12, fontWeight: 'bold' }}>
            //         {this.state.notiMessage}
            //         </Text>
            //     </Animated.View>
            // </View>
            <View style={{height: 50, backgroundColor: '#1cae81', position: 'relative', zIndex: 100, left:0, top:0,width:"100%"}}>
                {/* <View style={{ height: 70, backgroundColor: '#1cae81', justifyContent:  'center' }}>
                    <Text style={{ marginLeft: 16,  color: 'white',  fontSize:16, fontWeight: 'bold' }}>
                    {this.state.notiTitle}
                    </Text>
                    <Text style={{ marginLeft: 16,  color: 'white',  fontSize:12, fontWeight: 'bold' }}>
                    {this.state.notiMessage}
                    </Text>
                </View> */}

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
                {this.props.pageType==="homeDetails" ?
                <TouchableOpacity style={style.iconback} onPress={this.props.navigation.openDrawer}>
                    <Image source={require('../../assets/images/menubar.png')} style={style.mimg} />
                </TouchableOpacity>
                : 
                <TouchableOpacity style={style.iconback} onPress={() => this.props.navigation.goBack()}>
                    <Icon name="md-arrow-back" color="#fb6400" size={30} />
                </TouchableOpacity>
                }
                <View style={style.hwrap}>
                    <Text style={style.navh}>{this.props.label}</Text>
                    <View style={style.righticon}>
                        {this.props.label==="Profile" ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('EditProfile')}>
                                <Icon name="pencil" size={25} color="#fb6400" />
                            </TouchableOpacity>
                        :null}
                        {this.props.label==="Booking Details" &&  this.props.isEdit==true?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('BookingEdit', {bookingId:this.props.bookingId})}>
                                <Icon name="pencil" size={25} color="#fb6400" />
                            </TouchableOpacity>
                        :null}

                        {this.props.label==="Profile Details" &&  this.props.myId && this.props.to_id && this.props.to_id != this.props.myId ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Message',{to_id: this.props.to_id})}>
                                <Icon name="ios-chatbubble-ellipses-sharp" size={25} color="#fb6400" />
                            </TouchableOpacity>
                        :null}
                    </View>
                </View>
            </View>
            }
           </>
        )
    }
}

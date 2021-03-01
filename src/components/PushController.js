import React, { Component } from 'react'
import PushNotification from "react-native-push-notification";
import {senderIdFirebase} from './Api';
import {
    Platform, Animated, Text, View
  } from 'react-native';

export default class PushController extends Component {
    constructor(props) {
        super(props)
        this.animatedValue = new Animated.Value(-70)
      }
    componentDidMount(){
                    
        PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: function(token) {
            console.log("TOKEN:", token);
        },
        
        onNotification: (notification) => {
            if(notification.foreground==true){
                this.callToast()
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
    }

    callToast=()=> {
        Animated.timing(
          this.animatedValue,
          { 
            toValue: 0,
            duration: 350,
            useNativeDriver:true
          }).start(this.closeToast())
      }
      
      closeToast=()=>{
        // setTimeout(() => {
        //   Animated.timing(
        //   this.animatedValue,
        //   { 
        //     toValue: -70,
        //     duration: 350,
        //     useNativeDriver:true
        //   }).start()
        // }, 4000)
      }


    render() {
        //return null;
        return (
            <View>
                <Animated.View  style={{ transform: [{ translateY: this.animatedValue }], height: 70, backgroundColor: '#1cae81', position: 'absolute',left:0, top:0, right:0, justifyContent:  'center' }}>
                    <Text style={{ marginLeft: 10,  color: 'white',  fontSize:16, fontWeight: 'bold' }}>
                    Hello from Toast!
                    </Text>
                    <Text style={{ marginLeft: 10,  color: 'white',  fontSize:12, fontWeight: 'bold' }}>
                    Hello from Toast!
                    </Text>
                </Animated.View>
            </View>

        )
    }
}

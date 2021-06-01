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


export default class ChatList extends Component {
    constructor(props){
        super(props);  
        this.state = {
            showLoader: false,
          };   
    }

    componentDidMount = async() => {          
        this.goToMainChatBox();         
    };

    goToMainChatBox =()=>{
        this.props.navigation.navigate('Message',{to_id: ''});
    }

    render() {
        
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="homeDetails"
                    label="Messages"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />

                <NavigationEvents
                    onDidFocus={() => 
                        this.goToMainChatBox()
                    }
                />

                <ScrollView>     
                    <View style={style.container}>
                        <Text>No user found.</Text>
                    </View>
                </ScrollView>

            </SafeAreaView>
        )
    }
}

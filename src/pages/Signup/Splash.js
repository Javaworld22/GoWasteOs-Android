import React, { Component } from 'react'
import { Text, View, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style'
import {endPoints, POST, webClientId} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import store from "../../components/redux/store/index";
import {setUserDetails} from "../../components/redux/action/index";

export default class Splash extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        setTimeout(() => {this.autoLogin()}, 500)
    };

    fetchUserData = async () => {
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        
        let response = await POST(endPoints.profileDetails, formData, {
            Authorization: await Retrieve("userToken")
        });

        if (response && response.ack && response.ack == 1) {
            store.dispatch(setUserDetails(response.details));
            this.props.navigation.navigate('Home');
        }
    };

    autoLogin=async()=>{
        if (await Retrieve('loginStatus')==='true' && await Retrieve('userToken')!==null) {
            this.fetchUserData();
        } 
        else {
            if (await Retrieve('Welcome')==='shown') {
                this.props.navigation.navigate('Login');
            } else {
                this.props.navigation.navigate('Welcome');
            }
        } 
    }

    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                 <StatusBar backgroundColor="transparent" barStyle="dark-content" />
                 <ScrollView>
                    <View style={style.container}>
                        <View style={style.divgap}>
                            {/* <View style={style.rowCenter}>
                                <TouchableOpacity >
                                    <Image source={require('../../assets/images/logo.png')} style={{height:200, width:400}}></Image>
                                </TouchableOpacity>
                            </View>    */}
                            <View style={styles.logotop}>
                                <Image source={require('../../assets/images/logo-small.png')} style={styles.logo} />
                            </View>
                        </View>
                    </View>
                 </ScrollView>                
            </SafeAreaView>            
        )
    }
}

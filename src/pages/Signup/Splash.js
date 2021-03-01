import React, { Component } from 'react'
import { Text, View, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style'
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';

export default class Splash extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        setTimeout(() => {this.autoLogin()}, 500)
    };

    autoLogin=async()=>{
        if (await Retrieve('loginStatus')==='true' && await Retrieve('userToken')!==null) {
            this.props.navigation.navigate('Home');
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

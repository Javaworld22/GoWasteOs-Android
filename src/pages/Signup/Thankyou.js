import React, { Component } from 'react'
import { Text, View, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style'
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';

export default class Thankyou extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        setTimeout(() => {this.autoLogin()}, 1000)
    };

    autoLogin=async()=>{
        if (await Retrieve('loginStatus')==='true' && await Retrieve('userToken')!==null) {
            this.props.navigation.navigate('Home');
        } 
        else {
            this.props.navigation.navigate('Login')
        } 
    }

    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                 <StatusBar backgroundColor="transparent" barStyle="dark-content" />
                 <ScrollView>
                    <View style={style.container}>
                        <View style={[style.pT5, style.rowCenter, style.mT4]}>
                            <Icon name="ios-checkmark" color="#1cae81" size={120} />
                        </View>
                        <Text style={styles.thanktext}> Thank You! </Text>
                        <Text style={styles.thankline}>You have register successfully</Text>
                        {/* <Text style={styles.thankline}>Please login with your email and password</Text> */}

                        <View style={style.divgap}>
                            <View style={style.rowCenter}>
                                <TouchableOpacity style={styles.homebtn} onPress={() => this.props.navigation.navigate('Login')}>
                                    <Image source={require('../../assets/images/next-btn.png')} style={styles.btnimg}></Image>
                                </TouchableOpacity>
                            </View>   
                        </View>
                    </View>
                 </ScrollView>                
            </SafeAreaView>            
        )
    }
}

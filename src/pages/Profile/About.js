import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, ImageBackground } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import { dynamicImageURL, POST, endPoints } from "../../components/Api";
import { Retrieve } from "../../components/AsyncStorage";
import store from "../../components/redux/store/index";

export default class About extends Component {
    constructor(props){
        super(props); 
        this.state = {
            profileDetails: [],
        };    
    }

    render() {
        
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="homeDetails"
                    label="About Us"
                />

                <ScrollView>
                    <View style={style.container}>
                        <View style={[style.card, style.noborder]}>
                            <View style={style.cardbody}>
                                <View style={styles.inrbody}>
                                    <View style={[style.rowSec, style.mB2]}>
                                        <View style={[styles.info, style.mL1]}>
                                            <Text style={styles.smlabelAbout}>Other users can see you in this app based on your current location. It is not dependent on your address given at the time of signup or edit profile.</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

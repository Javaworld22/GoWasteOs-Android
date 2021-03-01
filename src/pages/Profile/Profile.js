import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, ImageBackground } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import { dynamicImageURL, POST, endPoints } from "../../components/Api";
import { Retrieve } from "../../components/AsyncStorage";
import store from "../../components/redux/store/index";

export default class Profile extends Component {
    constructor(props){
        super(props); 
        this.state = {
            profileDetails: [],
        };    
    }

    componentDidMount = () => {
        this.unsubscribe = store.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.unsubscribe();
      }

    render() {
        
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="homeDetails"
                    label="Profile"
                />

                <ScrollView>
                    <View style={style.container}>
                        <View style={styles.profiletop}>
                            <ImageBackground source={require('../../assets/images/profilebg.png')} style={styles.profileround} >
                                { store.getState().userDetails.profilePicture!==''?
                                <Image 
                                    source={{uri: store.getState().userDetails.profilePicture && store.getState().userDetails.profilePicture.includes("https://")?store.getState().userDetails.profilePicture:dynamicImageURL + "/" + store.getState().userDetails.profilePicture}} 
                                    style={styles.profileimg} 
                                />
                                : 
                                <Image 
                                    source={{uri: dynamicImageURL + "/img/no-image.jpg"}}
                                    style={styles.profileimg} 
                                />
                                }
                            </ImageBackground>
                            <View style={styles.procontent}>
                                <Text style={styles.namepro}>
                                    {store.getState().userDetails.firstName + " " +store.getState().userDetails.lastName}
                                </Text>
                                <Text style={styles.mailpro}>{store.getState().userDetails.email}</Text>
                            </View>
                        </View>
                        {/* <View style={styles.whitecard}>
                            <View style={[style.rowSec,]}>
                                <TouchableOpacity>
                                    <Ionicons name="md-camera" color="#212121" size={20} />
                                </TouchableOpacity>
                                <View style={style.mL1}>
                                    <Text style={[styles.label]}> Upload your profile photo</Text>
                                    <Text style={styles.mlabel}>Your photo helps to identify you for view.</Text>

                                    <View style={[style.rowSec,]}>
                                        <TouchableOpacity style={[style.mR1, style.mB1]}>
                                            <Text style={styles.grtext}>Upload </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[style.mL1, style.mB1]}>
                                            <Text style={styles.dismiss}>Dismiss </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                
                            </View>
                        </View> */}
                        <View style={[style.card, style.noborder]}>
                            <View style={style.cardbody}>
                                <View style={styles.inrbody}>
                                    <View style={[style.rowSec, style.mB2]}>
                                        <TouchableOpacity style={style.mR1}>
                                            <Icon name="ios-location" color="#fb6400" size={20} />
                                        </TouchableOpacity>
                                        <View style={[styles.info, style.mL1]}>
                                            <Text style={styles.label}>Location</Text>
                                            <Text style={styles.smlabel}>{store.getState().userDetails.address!=null?store.getState().userDetails.address:""}</Text>
                                        </View>
                                    </View>
                                    <View style={[style.rowSec, style.mB2]}>
                                        <TouchableOpacity style={style.mR1}>
                                            <Icon name="md-mail" color="#fb6400" size={20} />
                                        </TouchableOpacity>
                                        <View style={[styles.info, style.mL1]}>
                                            <Text style={styles.label}>Email</Text>
                                            <Text style={styles.smlabel}>{store.getState().userDetails.email}</Text>
                                        </View>
                                    </View>
                                    <View style={[style.rowSec, style.mB2]}>
                                        <TouchableOpacity style={style.mR1}>
                                            <Icon name="md-call" color="#fb6400" size={20} />
                                        </TouchableOpacity>
                                        <View style={[styles.info, style.mL1]}>
                                            <Text style={styles.label}>Phone</Text>
                                            <Text style={styles.smlabel}>{store.getState().userDetails.phoneNumber}</Text>
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

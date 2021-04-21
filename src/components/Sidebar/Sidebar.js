import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert, Linking, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './style';
import { dynamicImageURL, POST, endPoints, webClientId } from "../Api";
import { Store, Retrieve, Remove } from "../AsyncStorage";
import store from "../redux/store/index";
import {setUserDetails} from "../redux/action/index";
import NetInfo from '../InternetConnectivity'
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-community/google-signin';


export default class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "",
            userDetails: {},
            settingsDetails: {},
          };
         }
    

    componentDidMount = () => {
        NetInfo().then(() => {
            GoogleSignin.configure({
                scopes: [],
                webClientId: webClientId, 
                offlineAccess: true, 
                hostedDomain: '', 
                loginHint: '', 
                forceConsentPrompt: true, 
                accountName: '',
                //iosClientId: 'XXXXXX-krv1hjXXXXXXp51pisuc1104q5XXXXXXe.apps.googleusercontent.com'
            });
            this._fetchProfileData();
            this._fetchSettingsData();
        }).catch(() => {
            Alert.alert("", "Internet connection require.", [
                { text: "Ok"}
            ]);
        })         
      };

    _logOut = async () => {
        if(store.getState().userDetails.signuptype=="google"){
            this.signOut();
        }
        await Store("loginStatus", "false");
        await Store("userToken", "");
        await Store("userId", "");
        await Store("userType", "");
        
        store.dispatch(setUserDetails({}));
        this.props.navigation.navigate("Login");
    };

    signOut = async () => {
        try {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        } catch (error) {
          console.error(error);
        }
      };

      _fetchSettingsData = async () => {
        this.setState({type: await Retrieve('userType')});
        let response = await POST(endPoints.fetchSettings, {
            Authorization: await Retrieve("userToken")
        }); 
        if (response && response.details.ack && response.details.ack == 1) {
           this.setState({ settingsDetails: response.details.settings });
        } else {
            console.log("Error in 'fetchsettings' api");
        }
    };

    _fetchProfileData = async () => {
        this.setState({type: await Retrieve('userType')});
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        
        let response = await POST(endPoints.profileDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
       
        if (response && response.ack && response.ack == 1) {
            store.dispatch(setUserDetails(response.details));
            //this.forceUpdate();
           this.setState({ userDetails: response.details });
        } else {
            this._logOut();
            // console.log("Error in 'profileDetails' api");
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (store.getState().userDetails !== this.state.userDetails) {
            this.setState({ userDetails: store.getState().userDetails });
        }
    }

    makeCall = () => {
        console.log(this.state.settingsDetails.phoneNumber)
    let phoneNumber = '';  
    if (Platform.OS === 'android') {
        phoneNumber = 'tel:{'+this.state.settingsDetails.phoneNumber+'}';
    } else {
        phoneNumber = 'telprompt:${'+this.state.settingsDetails.phoneNumber+'}';
    }   
    Linking.openURL(phoneNumber);
    };



    render() {
        return (
            <SafeAreaView style={styles.sidebar}>
                <View style={styles.sidewrap}>
                        <View style={styles.profiletop}>
                            <View style={styles.profileround} >
                                { store.getState().userDetails.profilePicture!==''?
                                <Image 
                                    source={{uri: store.getState().userDetails.profilePicture && store.getState().userDetails.profilePicture.includes("https://")?store.getState().userDetails.profilePicture:dynamicImageURL + "/" + this.state.userDetails.profilePicture}} 
                                    style={styles.profileimg} 
                                />
                                : 
                                <Image 
                                    source={{uri: dynamicImageURL + "/img/no-image.jpg"}}
                                    style={styles.profileimg} 
                                />
                                }
                                <TouchableOpacity style={styles.profilebadge}  onPress={() => this.props.navigation.navigate('EditProfile')} >
                                    <Icon name="md-camera" color="#1cae81" size={16} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.procontent}>                           
                                <Text style={styles.namepro}>
                                {/* {store.getState().userDetails.firstName +
                                " " +
                                store.getState().userDetails.lastName} */}
                                {this.state.userDetails.firstName +
                                " " +
                                this.state.userDetails.lastName}
                                </Text>                                
                            </View>
                        </View>
                        <ScrollView>
                            <View style={styles.menuwrap}>
                            <TouchableOpacity 
                                    style={styles.menulink}
                                    onPress={() => this.props.navigation.navigate('Home')}
                                > 
                                    <View style={styles.imgbx}>
                                        <Icon name="ios-home" color="#fbc201" size={20} />
                                    </View>
                                    <Text style={styles.linktext}>Home</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menulink}
                                    onPress={() => this.props.navigation.navigate('Profile')}
                                > 
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon1.png')} style={styles.micon} /> 
                                    </View>
                                    <Text style={styles.linktext}>Profile</Text>
                                </TouchableOpacity>

                                {/* <TouchableOpacity 
                                    style={styles.menulink}
                                    onPress={() => this.props.navigation.navigate('EditProfile')}
                                > 
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon1.png')} style={styles.micon} /> 
                                    </View>
                                    <Text style={styles.linktext}>Edit Profile</Text>
                                </TouchableOpacity> */}

                                {
                                    this.state.type=="C"?
                                    <>
                                    <TouchableOpacity 
                                    style={styles.menulink}
                                        onPress={() => this.props.navigation.navigate('JobPost')}
                                    > 
                                        <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/s3.png')} style={{resizeMode:'contain',height:26,width:26}} /> 
                                        </View>
                                        <Text style={styles.linktext}>Post a job</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.menulink}
                                        onPress={() => this.props.navigation.navigate('JobList')}
                                    > 
                                        <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/s2.png')} style={{resizeMode:'contain',height:26,width:26}} /> 
                                        </View>
                                        <Text style={styles.linktext}>Job List</Text>
                                    </TouchableOpacity>
                                    </>:null
                                }



                                <TouchableOpacity 
                                style={styles.menulink}
                                onPress={() => this.props.navigation.navigate('Notification')}> 
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon2.png')} style={styles.micon} /> 
                                    </View> 
                                    <Text style={[styles.linktext]}>Notifications</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menulink} onPress={() => this.props.navigation.navigate('About')}>
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon3.png')} style={styles.micon} /> 
                                    </View>
                                   <Text style={styles.linktext}>About Us</Text>
                                </TouchableOpacity>
                                {/* <TouchableOpacity style={styles.menulink}>
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon3.png')} style={styles.micon} /> 
                                    </View>
                                   <Text style={styles.linktext}>Invite friends</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menulink}> 
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon4.png')} style={styles.micon} /> 
                                    </View>
                                    <Text style={styles.linktext}>Terms & Condition</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menulink}> 
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon5.png')} style={styles.micon} /> 
                                    </View> 
                                    <Text style={styles.linktext}>Promos</Text>
                                </TouchableOpacity>*/}
                                <TouchableOpacity style={styles.menulink} onPress={this.makeCall} > 
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon6.png')} style={styles.micon} /> 
                                    </View>
                                    <Text style={styles.linktext}>Help</Text>                                    
                                </TouchableOpacity> 

                                <TouchableOpacity 
                                    style={styles.menulink}
                                    onPress={() => this.props.navigation.navigate('BookingConfirmList')}
                                >  
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon4.png')} style={styles.micon} /> 
                                    </View> 
                                    <Text style={styles.linktext}>Booking Confirm List</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menulink}
                                    onPress={() => this.props.navigation.navigate('BookingHistory')}
                                >  
                                    <View style={styles.imgbx}>
                                    <Image source={require('../../assets/images/s1.png')} style={{resizeMode:'contain',height:26,width:26}} /> 
                                    </View> 
                                    <Text style={styles.linktext}>Booking List</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menulink}
                                    onPress={() => this.props.navigation.navigate('ChangePassword')}
                                >  
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon7.png')} style={styles.micon} /> 
                                    </View> 
                                    <Text style={styles.linktext}>Change password</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.menulink}
                                    onPress={() => this._logOut()}
                                >  
                                    <View style={styles.imgbx}>
                                        <Image source={require('../../assets/images/micon8.png')} style={styles.micon} /> 
                                    </View>
                                    <Text style={styles.linktext}>Logout</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                </View>
            </SafeAreaView>
           
        )
    }
}

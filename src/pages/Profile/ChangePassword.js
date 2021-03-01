import React, { Component } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, 
        StatusBar, Image, ScrollView, TextInput, 
        Alert,KeyboardAvoidingView } from 'react-native';
        
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import { dynamicImageURL, POST, endPoints } from "../../components/Api";
import { Store, Retrieve, Remove } from "../../components/AsyncStorage";
import store from "../../components/redux/store/index";
import {setUserDetails} from "../../components/redux/action/index";
import Loader from '../../components/Loader';

export default class ChangePassword extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
            currentpass:'',
            newpass: '',
            conpass: '',
            isCurrentpassError: false,
            isNewpassError: false,
            isConpassError: false,
            isMatchPasswordError: false,
            isSubmit:false,
            isApiError: false,
            apiMessage: '',
            showLoader: false,
        };
    }

    _changePasswordSubmit = async () => {
        this.setState({isApiError: false});
        if (this.state.currentpass.trim() === '') {
            this.setState({isCurrentpassError: true});
            this.refCurrentpass.focus();
            return;
        } else {
            this.setState({isCurrentpassError: false});
        }

        if (this.state.newpass.trim() === '') {
            this.setState({isNewpassError: true});
            this.refNewpass.focus();
            return;
        } else {
            this.setState({isNewpassError: false});
        }
    
        if (this.state.conpass.trim() === '') {
            this.setState({isConpassError: true});
            this.refConpass.focus();
            return;
        } else {
            this.setState({isConpassError: false});
        }

        if (this.state.conpass.trim() !== this.state.newpass.trim()) {
            this.setState({isMatchPasswordError: true});
            this.refConpass.focus();
            return;
        } else {
            this.setState({isMatchPasswordError: false});
        }
    
        this.setState({
            isCurrentpassError: false,
            isNewpassError: false,
            isConpassError: false,
            isMatchPasswordError: false,
        });
    
        let formData = new FormData();
        formData.append('user_id', store.getState().userDetails.id);
        formData.append('current_password', this.state.currentpass);
        formData.append('new_password', this.state.newpass);
        formData.append('con_password', this.state.conpass);
    
        this.setState({showLoader: true});
        let response = await POST(endPoints.changePassword, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
    
        // console.log(response);
        
        if (response.ack == '1') {
            await Store("loginStatus", "false");
            await Store("userToken", "");
            await Store("userId", "");
            store.dispatch(setUserDetails({}));
        
            Alert.alert(
                "",
                response.message,
                [{ text: "Ok", onPress: () => this.props.navigation.navigate('Login') }]
            );

        } else {
          this.setState({isApiError: true, apiMessage: response.message});
        }
    };


    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Change Password"
                />

                <Loader 
                    loading={this.state.showLoader} 
                />
                <KeyboardAvoidingView>
                    <ScrollView>
                        <View style={[style.container, styles.flextopprofile]}>
                            <View style={styles.profilewrap}>
                                <View style={styles.profileimgwrap} >
                                    { store.getState().userDetails.profilePicture!==''?
                                    <Image 
                                        source={{uri: dynamicImageURL + "/" + store.getState().userDetails.profilePicture}} 
                                        style={styles.profileimg} 
                                    />
                                    : 
                                    <Image 
                                        source={{uri: dynamicImageURL + "/img/no-image.jpg"}}
                                        style={styles.profileimg} 
                                    />
                                    }
                                </View>
                            </View>

                            <View style={style.mT2}>
                            {/* <Text style={styles.label}>Current Password</Text> */}
                                <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="Current Password" 
                                        placeholderTextColor="#acacac" 
                                        style={style.forminput}
                                        secureTextEntry
                                        ref={ref => (this.refCurrentpass = ref)}
                                        onChangeText={text =>this.setState({currentpass: text})}
                                    />
                                </View>
                                {this.state.isCurrentpassError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )}

                                {/* <Text style={styles.label}>New Password</Text> */}
                                <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="New Password" 
                                        placeholderTextColor="#acacac" 
                                        style={style.forminput}
                                        secureTextEntry
                                        ref={ref => (this.refNewpass = ref)}
                                        onChangeText={text =>this.setState({newpass: text})}
                                    />
                                </View>
                                {this.state.isNewpassError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )}

                                {/* <Text style={styles.label}>Confirm Password</Text> */}
                                <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="Confirm Password" 
                                        placeholderTextColor="#acacac" 
                                        style={style.forminput}
                                        secureTextEntry
                                        ref={ref => (this.refConpass = ref)}
                                        onChangeText={text =>this.setState({conpass: text})}
                                    />
                                </View>

                                {this.state.isConpassError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )}

                                {this.state.isMatchPasswordError && (
                                    <Text style={style.errorMsg}>
                                        Confirm password does not match.
                                    </Text>
                                )}

                                {this.state.isApiError && (
                                    <Text style={style.errorMsg}>
                                        {this.state.apiMessage}
                                    </Text>
                                )}

                                <View>
                                    <TouchableOpacity 
                                        style={[style.themebtn,style.mT4]} 
                                        onPress={() => this._changePasswordSubmit()}
                                    >
                                        <Text style={style.btntext}>Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
            
        )
    }
}

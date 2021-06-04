import React, { Component } from 'react'
import { Text, TextInput, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar,Alert,Image, KeyboardAvoidingView } from 'react-native'
import OtpInputs from 'react-native-otp-inputs';

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style'
import {endPoints, POST} from '../../components/Api';
import Loader from '../../components/Loader';
export default class ResetPassword extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
          username: this.props.navigation.state.params.username?this.props.navigation.state.params.username:"",
          otp: '',
          password: '',
          confirmPassword: '',
          isConfirmPasswordError: false,
          isOtpError: false,
          isPasswordError: false,
          showLoader: false,
          secureText: true,
          secureTexts: true,
          confirmpasswordError: "",
        };
    }
    changeSecurity=()=>{
        this.setState({secureText: !this.state.secureText});
    }
    changeSecuritys=()=>{
        this.setState({secureTexts: !this.state.secureTexts});
    }

    submit=async()=>{
        if (this.state.otp.trim() === '') {
            this.setState({isOtpError: true});
            this.refOtp.focus();
            return;
          } else {
            this.setState({isOtpError: false});
          }

          if (this.state.password === '') {
            this.setState({isPasswordError: true});
            this.refPassword.focus();
            return;
          } else {
            this.setState({isPasswordError: false});
          }

          if (this.state.confirmPassword === '') {
            this.setState({isConfirmPasswordError: true});
            this.setState({confirmpasswordError: "This field is require"});
            this.refConfirmPassword.focus();
            return;
          } else {
            this.setState({isConfirmPasswordError: false});
          }

          if (this.state.confirmPassword != '' && this.state.password && this.state.confirmPassword != this.state.password) {
            this.setState({isConfirmPasswordError: true});
            this.setState({confirmpasswordError: "password does not match."});
            this.refConfirmPassword.focus();
            return;
          } else {
            this.setState({isConfirmPasswordError: false});
            this.setState({confirmpasswordError: ""});
          }
      
          this.setState({
            isConfirmPasswordError: false,
            isOtpError: false,
            isPasswordError: false,
          });

          let formData = new FormData();
          if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.state.username.trim())){
                formData.append('email', this.state.username);
          }else{
            formData.append('phoneNumber', this.state.username);
          }  
          formData.append('otp', this.state.otp);
          formData.append('password', this.state.password);
          formData.append('con_password', this.state.confirmPassword);

          this.setState({showLoader: true});
          let response = await POST(endPoints.resetPassword, formData);
          if (response.ack == '1') {
            this.setState({showLoader: false});
              Alert.alert("", response.message, [
                { text: "Ok", onPress: () =>  this.props.navigation.navigate('Login')}
            ]);
          } else {
            this.setState({showLoader: false});
            Alert.alert("", response.message, [
                { text: "Ok", onPress: () =>  console.log("cancel")}
            ]);
          }
          this.setState({showLoader: false});
    }
    resend=async()=>{
        if(this.state.username!=""){
            let formData = new FormData();
            if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.state.username.trim())){
                formData.append('email', this.state.username);
            }else{
                formData.append('phoneNumber', this.state.username);
            }      
            this.setState({showLoader: true});
            let response = await POST(endPoints.forgotPassword, formData);
            this.setState({showLoader: false});
    
            if (response.ack == '1') {
                console.log(response);
                Alert.alert("", response.message, [
                  { text: "Ok", onPress: () =>  console.log("ok")}
              ]);
            } else {
              Alert.alert("", response.message, [
                  { text: "Ok", onPress: () =>  console.log("cancel")}
              ]);
            }
        }else{
            Alert.alert("", "Username not available. Please go back and try again.", [
                { text: "Ok", onPress: () =>  console.log("cancel")}
            ]);
        }

    }
    
    render() {  
        return (
            <SafeAreaView style={style.wrapper}>
                 <StatusBar backgroundColor="transparent" barStyle="dark-content" />
                 <Loader 
                    loading={this.state.showLoader} 
                />
                <KeyboardAvoidingView>
                    <View style={style.hnavigation}>
                        <TouchableOpacity style={style.iconback} onPress={() => this.props.navigation.goBack()}>
                            <Icon name="md-arrow-back" color="#fb6400" size={30} />
                        </TouchableOpacity>                        
                    </View>
                    <ScrollView>
                        <View style={style.container}>
                            <View style={styles.otpbox}>
                            <View style={styles.logotop}>
                                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                            </View>
                                <Text style={styles.ptext}>Reset Password</Text>
                                    <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="OTP" 
                                            placeholderTextColor="#acacac" 
                                            style={style.forminput}
                                            ref={ref => (this.refOtp= ref)}
                                            onChangeText={text => this.setState({otp: text})}
                                        />

                                    </View>
                                    {this.state.isOtpError && (
                                        <Text style={styles.errorMsg}>
                                            This field is required
                                        </Text>
                                    )}  
                                    <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="Password" 
                                            placeholderTextColor="#acacac" 
                                            secureTextEntry={this.state.secureText}
                                            style={style.forminput}
                                            ref={ref => (this.refPassword = ref)}
                                            onChangeText={text => this.setState({password: text})}
                                            autoCapitalize = 'none'
                                        />
                                        <TouchableOpacity style={style.iconwrap} onPress={this.changeSecurity} >
                                            {this.state.secureText==true?
                                            <Icon name="ios-eye-off" color="#1cae81" size={22} />:
                                            <Icon name="ios-eye" color="#1cae81" size={22} />
                                            } 
                                        </TouchableOpacity>
                                    </View>
                                    {this.state.isPasswordError && (
                                        <Text style={styles.errorMsg}>
                                            This field is required
                                        </Text>
                                    )} 
                                        <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="Confirm Password" 
                                            placeholderTextColor="#acacac" 
                                            secureTextEntry={this.state.secureTexts}
                                            style={style.forminput}
                                            ref={ref => (this.refConfirmPassword = ref)}
                                            onChangeText={text => this.setState({confirmPassword: text})}
                                            autoCapitalize = 'none'
                                        />
                                        <TouchableOpacity style={style.iconwrap} onPress={this.changeSecuritys} >
                                            {this.state.secureTexts==true?
                                            <Icon name="ios-eye-off" color="#1cae81" size={22} />:
                                            <Icon name="ios-eye" color="#1cae81" size={22} />
                                            } 
                                        </TouchableOpacity>
                                    </View>
                                    {this.state.isConfirmPasswordError && (
                                        <Text style={styles.errorMsg}>
                                            {this.state.confirmpasswordError}
                                        </Text>
                                    )}                                  
                                </View>
                                
                            <TouchableOpacity style={[style.themebtn, style.mB1]} onPress={this.submit}>
                                <Text style={style.btntext}>Submit</Text>
                            </TouchableOpacity>
                            <View style={style.rowCenter}>
                                <TouchableOpacity onPress={() => this.resend()}>
                                    <Text style={[styles.logtext, style.linktext]}>Resend OTP</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
           
        )
    }
}

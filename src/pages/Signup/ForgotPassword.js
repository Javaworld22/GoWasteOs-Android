import React, { Component } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView, SafeAreaView, StatusBar, KeyboardAvoidingView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style'

import {endPoints, POST} from '../../components/Api';
import Loader from '../../components/Loader';

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          email: '',
          username: '',
          isEmailError: false,
          isEmailValidationError: false,
          isloginPhoneError:"",
          showLoader:false
        };
    }

    submit=async()=>{
        if (this.state.username.trim() === '') {
            this.setState({isEmailError: true});
            this.refEmail.focus();
            return;
          } else {
            this.setState({isEmailError: false});
          }


          var phonenoRegx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
          if (this.state.username.trim().match(Regex.VALID_EMAIL) || Number.isInteger(parseInt(this.state.username))) {
              console.log(Number.isInteger(parseInt(this.state.username)))
              this.setState({ isEmailValidationError: false }); 
              if(!this.state.username.trim().match(Regex.VALID_EMAIL) && this.state.username.indexOf('0')!==0){
                  this.setState({ isloginPhoneError: "Phone number should start with 0." });
                  this.refEmail.focus();
                  return;
  
              }else if(!this.state.username.trim().match(Regex.VALID_EMAIL) && this.state.username.indexOf('0')==0 && !Number(this.state.username).toString().match(phonenoRegx)){
                  this.setState({ isloginPhoneError: "Phone Number must be 10 digit." });
                  this.refEmail.focus();
                  return;
              }
              else{
                  this.setState({ isloginPhoneError: "" }); 
              }
              
          } else{
              this.setState({isEmailValidationError: true});
              this.refEmail.focus();
              return;
          }
        //   var phonenoRegx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        //   if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.state.username.trim()) || this.state.username.match(phonenoRegx)){
        //     this.setState({isEmailValidationError: false});
        //   }else{
        //     this.setState({isEmailValidationError: true});
        //     this.refEmail.focus();
        //     return;
        //   }
      
          this.setState({
            isEmailError: false,
            isEmailValidationError: false,
            isloginPhoneError: "",
          });

            let formData = new FormData();
            if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.state.username.trim())){
                formData.append('email', this.state.username);
            }else{
                formData.append('phoneNumber', this.state.username);
            }
      
          this.setState({showLoader: true});
          let response = await POST(endPoints.forgotPassword, formData);
          this.setState({showLoader: false});
          console.log(response);
          if (response.ack == '1') {
              if(response.email){
                Alert.alert("", response.message, [
                    { text: "Ok", onPress: () =>  this.props.navigation.navigate('ResetPassword',{username: response.email})}
                ]);
              }else{
                Alert.alert("", response.message, [
                    { text: "Ok", onPress: () =>  this.props.navigation.navigate('ResetPassword',{username: response.phoneNumber})}
                ]);
              }
          } else {
            Alert.alert("", response.message, [
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
                <KeyboardAvoidingView >
                    <View style={style.hnavigation}>
                        <TouchableOpacity style={style.iconback} onPress={() => this.props.navigation.goBack()}>
                            <Icon name="md-arrow-back" color="#fb6400" size={30} />
                        </TouchableOpacity>                        
                    </View>
                    <ScrollView>
                        <View style={style.container}>  
                            <View style={styles.logotop}>
                                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                            </View>                          
                            <View style={[styles.loginbody, style.pB2]}>
                                <Text style={styles.lheading}>Forgot password </Text>
                                <Text style={styles.ltext}>Please enter your email or phone number, so we can help you recover your password. </Text>

                                <View style={[style.mB2, style.pT2]}>                                    
                                    <View style={style.roundinput}>
                                        <TextInput  
                                        ref={ref => (this.refEmail = ref)}
                                        onChangeText={text => this.setState({username: text})}
                                        autoCapitalize = 'none'
                                        placeholder="Email or Phone"
                                        placeholderTextColor="#acacac" 
                                        style={style.forminput}/>
                                        {/* <TouchableOpacity style={style.iconwrap}><Icon name="ios-mail" color="#1cae81" size={22} /></TouchableOpacity> */}
                                    </View>
                                    {(this.state.isEmailError || this.state.isEmailValidationError) && (
                                        <Text style={styles.errorMsg}>
                                            {this.state.isEmailError
                                            ? 'This field is required'
                                            : 'Email Or Phone is not valid'}
                                        </Text>
                                    )}
                                    {(this.state.isloginPhoneError!="") && (
                                        <Text style={styles.errorMsg}>
                                            {this.state.isloginPhoneError}
                                        </Text>
                                    )}
                                   
                                </View> 
                                <View>
                                    <TouchableOpacity style={[style.themebtn, style.mT1]} onPress={() => this.submit()}>
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

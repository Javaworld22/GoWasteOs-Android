import React, { Component } from 'react';
import { Text, View, TextInput, TouchableOpacity, 
        Image, ScrollView, SafeAreaView, StatusBar, 
         KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-community/picker';

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import {endPoints, POST, googleApiKey} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Regex from '../../components/RegexMatch';
import Loader from '../../components/Loader';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
export default class SignUp extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
        //   firstName: '',
        //   lastName: '',
          name:'',
          email: '',
          phone:'',
          type:'',
          address: '',
          password: '',
          confirmPassword: '',
        //   isFirstNameError: false,
        //   isLastNameError: false,
          isNameError:false,
          isEmailError: false,
          isPhoneError: false,
          isAddressError: false,
          isPasswordError: false,
          isConfirmPasswordError: false,
          isMatchPasswordError: false,
          isSigningUp: false,
          isEmailValidationError: false,
          isPhoneValidationError: false,
          isNameValidationError: false,
          isApiError: false,
          apiMessage: '',
          showLoader: false,
          secureText: true,
          secureTexts: true,
          lattitude:"",
          longitude:"",
          details:{}
        };
      }

      changeSecurity=()=>{
        this.setState({secureText: !this.state.secureText});
      }
      changeSecuritys=()=>{
        this.setState({secureTexts: !this.state.secureTexts});
      }
    
      _signUp = async () => {
        
        this.setState({ isApiError: false })

        if (this.state.name.trim() === '') {
            this.setState({isNameError: true});
            this.refName.focus();
            return;
        } else {
            this.setState({isNameError: false});
            if(/[!@#$%^&*(),.?":{}|<>]/g.test(this.state.name) || /\d+/g.test(this.state.name)) {
                this.setState({isNameValidationError: true});
                this.refName.focus();
                return;
            } else {
                this.setState({isNameValidationError: false});
            }
        }
        
        // if (!this.state.firstName.trim().match(Regex.VALID_NAME)) {
        //   this.setState({isFirstNameValidationError: true});
        //   this.refFirstName.focus();
        //   return;
        // } else {
        //   this.setState({isFirstNameValidationError: false});
        // }
    
        // if (this.state.lastName.trim() === '') {
        //   this.setState({isLastNameError: true});
        //   this.refLastName.focus();
        //   return;
        // } else {
        //   this.setState({isLastNameError: false});
        // }
    
        // if (!this.state.lastName.trim().match(Regex.VALID_NAME)) {
        //   this.setState({isLastNameValidationError: true});
        //   this.refLastName.focus();
        //   return;
        // } else {
        //   this.setState({isLastNameValidationError: false});
        // }
    
        if(this.state.email.trim() != '') {
            if (!this.state.email.trim().match(Regex.VALID_EMAIL)) {
                this.setState({isEmailValidationError: true});
                this.refEmail.focus();
                return;
            } else {
                this.setState({isEmailValidationError: false});
                this.setState({isEmailError: false});
            }
        } 


        if (this.state.phone.trim() === '') {
            this.setState({isPhoneError: true});
            this.refPhone.focus();
            return;
        } else {
            var phonenoRegx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            if(this.state.phone.match(phonenoRegx)){
                this.setState({isPhoneError: false});
                this.setState({isPhoneValidationError: false});
            }else{
                this.setState({isPhoneValidationError: true});
                this.setState({isPhoneError: false});
                this.refPhone.focus();
                return;
            }
        }


        if (this.state.password.trim() === '') {
          this.setState({isPasswordError: true});
          this.refPassword.focus();
          return;
        } else {
          this.setState({isPasswordError: false});
        }
    
        if (this.state.confirmPassword.trim() === '') {
          this.setState({isConfirmPasswordError: true});
          this.refConfirmPassword.focus();
          return;
        } else {
          this.setState({isConfirmPasswordError: false});
        }

        if (this.state.confirmPassword.trim() !== this.state.password.trim()) {
            this.setState({isMatchPasswordError: true});
            this.refConfirmPassword.focus();
            return;
        } else {
            this.setState({isMatchPasswordError: false});
        }

        // if (this.state.address.trim() === '') {
        //     this.setState({isAddressError: true});
        //     //this.refAddress.focus();
        //     return;
        // } else {
        //     this.setState({isAddressError: false});
        // }

        if (this.state.type === '') {
            this.setState({isTypeError: true});
            return;
        } else {
            this.setState({isTypeError: false});
        }
    
        this.setState({
        //   isFirstNameError: false,
        //   isLastNameError: false,
          isNameError: false,
          isEmailError: false,
          isEmailValidationError: false,
          isNameValidationError: false,
          isPhoneError: false,
          isTypeError: false,
          isAddressError: false,
          isPasswordError: false,
          isConfirmPasswordError: false,
          isMatchPasswordError: false,
          isApiError: false
        });
    
        let formData = new FormData();
        if(this.state.name.indexOf(' ') >= 0){
            formData.append('firstName', this.state.name.split(' ')[0]);
            formData.append('lastName', this.state.name.split(' ')[1]);
        }else{
            formData.append('firstName', this.state.name);
            formData.append('lastName', "");
        }
        if(this.state.email!=""){
            formData.append('email', this.state.email);
        }
        if(this.state.phone!=""){
             formData.append('phoneNumber', this.state.phone); 
        }
        
        //formData.append('address', this.state.address);
        formData.append('lattitude', this.state.lattitude);
        formData.append('longitude', this.state.longitude);
        formData.append('password', this.state.password);
        formData.append('conpassword', this.state.confirmPassword);
        formData.append('type', this.state.type);

        this.setState({showLoader: true});
        let response = await POST(endPoints.signUp, formData);
        
        console.log(response)
        if(response.details.ack == '1') {
          this.setState({
            // firstName: "",
            // lastName: "",
            name: "",
            email: "",
            phone: "",
            type:'',
            address: "",
            password: "",
            confirmPassword: "",
            lattitude:"",
            longitude:"",
            
          })

          this.setState({details: response.details.loginDetails},
            () => {
                this.autoLogin();
            }
        );         
          //this.props.navigation.navigate('Thankyou');
        } else {
            this.setState({showLoader: false});
            this.setState({isApiError: true, apiMessage: response.details.message});
        }

    };

    autoLogin=async()=>{
        let formData = new FormData();
        if(this.state.details.email){
            formData.append('email', this.state.details.email);
          //  formData.append('phoneNumber', "");
        }
        if(this.state.details.phone){
            formData.append('phoneNumber', this.state.details.phone);
           // formData.append('email', "");
        }
        formData.append('password', this.state.details.password);
    
        //this.setState({showLoader: true});
        let response = await POST(endPoints.logIn, formData);
        console.log(response)
        this.setState({showLoader: false});  
        if (response.ack == '1') {
          await Store('userToken', response.details.token);
          await Store('userId', response.details.id);
          await Store('userType', response.details.type);
          await Store('loginStatus', 'true');   
          this.props.navigation.navigate('Thankyou');
        } else {
          this.setState({isApiError: true, apiMessage: response.message});
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
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View style={style.container}>
                            <View style={styles.logotop}>
                                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                            </View>
                            <View style={[styles.loginbody, style.pB2]}>
                                <View style={[style.mB2, style.pT2]}>

                                    <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="Name" 
                                            placeholderTextColor="#acacac" 
                                            style={style.forminput}
                                            ref={ref => (this.refName = ref)}
                                            onChangeText={text => this.setState({name: text})}
                                        />
                                        <TouchableOpacity style={style.iconwrap}><Icon name="ios-person" color="#1cae81" size={22} /></TouchableOpacity>
                                    </View>
                                    
                                    {(this.state.isNameError || this.state.isNameValidationError) && (
                                        <Text style={styles.errorMsg}>
                                            {this.state.isNameError
                                            ? 'This field is required'
                                            : 'Name is not valid'}
                                        </Text>
                                    )}

                                    <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="Email" 
                                            placeholderTextColor="#acacac" 
                                            style={style.forminput}
                                            ref={ref => (this.refEmail = ref)}
                                            onChangeText={text => this.setState({email: text})}
                                            autoCapitalize = 'none'
                                        />
                                        <TouchableOpacity style={style.iconwrap}><Icon name="ios-mail" color="#1cae81" size={22} /></TouchableOpacity>
                                    </View>
                                    {(this.state.isEmailError || this.state.isEmailValidationError) && (
                                        <Text style={styles.errorMsg}>
                                            {this.state.isEmailError
                                            ? ''
                                            : 'Email address is not valid'}
                                        </Text>
                                    )}

                                    <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="phone" 
                                            placeholderTextColor="#acacac" 
                                            style={style.forminput}
                                            ref={ref => (this.refPhone = ref)}
                                            onChangeText={text => this.setState({phone: text})}
                                            autoCapitalize = 'none'
                                        />
                                        <TouchableOpacity style={style.iconwrap}><Icon name="call" color="#1cae81" size={22} /></TouchableOpacity>
                                    </View>
                                    {(this.state.isPhoneError || this.state.isPhoneValidationError) && (
                                        <Text style={styles.errorMsg}>
                                            {this.state.isPhoneError
                                            ? 'This field is required'
                                            : 'Phone is not valid'}
                                        </Text>
                                    )}

                                    <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="Password" 
                                            placeholderTextColor="#acacac" 
                                            style={style.forminput}
                                            secureTextEntry={this.state.secureText}
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
                                            style={style.forminput}
                                            secureTextEntry={this.state.secureTexts}
                                            ref={ref => (this.refConfirmPassword = ref)}
                                            onChangeText={text =>this.setState({confirmPassword: text})}
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
                                            This field is required
                                        </Text>
                                    )}

                                    {this.state.isMatchPasswordError && (
                                        <Text style={styles.errorMsg}>
                                            Confirm password does not match.
                                        </Text>
                                    )}

                                    {/* <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="Phone No." 
                                            placeholderTextColor="#acacac" 
                                            keyboardType='phone-pad'
                                            style={style.forminput}
                                            ref={ref => (this.refPhone = ref)}
                                            onChangeText={text => this.setState({phone: text})}
                                        />
                                        <TouchableOpacity style={style.iconwrap}><Icon name="ios-call" color="#1cae81" size={22} /></TouchableOpacity>
                                    </View>
                                    {this.state.isPhoneError && (
                                        <Text style={styles.errorMsg}>
                                            This field is required
                                        </Text>
                                    )}*/}


                                
                                {/* <View style={style.roundinput}>

                                    <GooglePlacesAutocomplete
                                    placeholder='Address'
                                    styles={{textInput: { height: 30 }}}
                                    fetchDetails = {true}
                                    listViewDisplayed='auto' 
                                    //ref={ref => (this.refAddress = ref)}
                                    onPress={(data, details = null) => {
                                        this.setState({ 
                                            address: data.description, 
                                            lattitude: details.geometry.location.lat, 
                                            longitude: details.geometry.location.lng, 
                                        })
                                        
                                        }}
                                    query={{
                                        key: googleApiKey,
                                        language: 'en',
                                    }}
                                    />
                                    <TouchableOpacity style={style.iconwrap}><Icon name="ios-locate" color="#1cae81" size={22} /></TouchableOpacity>
                                   
                                </View>
                                {this.state.isAddressError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )} */}

                                    <View style={style.roundinput}>
                                        <Picker
                                            style={[style.forminput],{width:'100%', height:40}}
                                            selectedValue={this.state.type}
                                            onValueChange={(itemValue, itemIndex) => this.setState({ type: itemValue })}
                                        >
                                            <Picker.Item label="Select type" value="" />
                                            <Picker.Item label="Customer" value="C" />
                                            <Picker.Item label="Service Provider" value="SP" />
                                        </Picker>
                                        
                                    </View>
                                    {this.state.isTypeError && (
                                        <Text style={styles.errorMsg}>
                                            This field is required
                                        </Text>
                                    )}


                                   
                                </View>                              

                                    {this.state.isApiError && (
                                        <Text style={styles.errorMsg}>
                                            {this.state.apiMessage}
                                        </Text>
                                    )}
                                    
                                    
                                    <TouchableOpacity 
                                        style={[style.themebtn, style.mT1]} 
                                        onPress={() => this._signUp()}
                                    >
                                        <Text style={style.btntext}>Sign Up</Text>
                                    </TouchableOpacity>
                                    <View style={style.rowCenter}>
                                        <Text style={styles.logtext}>Already have an account?  </Text>
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')}>
                                            <Text style={[styles.logtext, style.linktext]}>Sign In</Text>
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

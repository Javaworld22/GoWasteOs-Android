import React, { Component } from 'react';
import { Text,Button, View, TextInput, TouchableOpacity, Image, ScrollView, SafeAreaView, StatusBar, KeyboardAvoidingView, Alert } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Regex from '../../components/RegexMatch';
import {endPoints, POST, webClientId} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import store from "../../components/redux/store/index";
import {setUserDetails} from "../../components/redux/action/index";
import Loader from '../../components/Loader';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-community/google-signin';
import {
    AccessToken,
    GraphRequest,
    GraphRequestManager,
    LoginManager,
  } from 'react-native-fbsdk';
import NetInfo from '../../components/InternetConnectivity'
import Modal from 'react-native-modal';
import { BackHandler } from 'react-native';
import { Picker } from '@react-native-community/picker';


export default class Login extends Component {

    constructor(props) {
        super(props);    
        this.state = {
          email: '',
          username: '',
          password: '',
          isEmailError: false,
          isEmailValidationError: false,
          isloginPhoneError:"",
          isPasswordError: false,
          isSigningIn: false,
          isApiError: false,
          apiMessage: '',
          showLoader: false,
          secureText: true,
          signuptype:"",
          type:"",
          bankAccountNo:'',
          bankName:'',
          userInfo:{},
          modalVisible:false,
          phone:"",
          isDetailsError:false,
          modalError:"",
        };
    }

    componentDidMount = async () => {
        this.setState({showLoader: true});

        //this.createChannel();
        
        if (await Retrieve('loginStatus')==='true' && await Retrieve('userToken')!==null) {
          this.props.navigation.navigate('Home');
          this.setState({showLoader: false});
        } else {
          this.setState({showLoader: false});
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
        }    
    };

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    onBackPress = () => {
        Alert.alert(
        ' Exit From App ',
        ' Do you want to exit ?',
        [
            { text: 'Yes', onPress: () => BackHandler.exitApp() },
            { text: 'No', onPress: () => console.log('NO Pressed') }
        ],
        { cancelable: false },
        );
        return true;
    }



    signin=(type)=>{
        NetInfo().then(() => {
            this.setState({signuptype: type},
                ()=>{
                    if(type=="google"){
                    this._signIn();
                    }
                if(type=="fb"){
                    this.loginWithFacebook();
                }}
            );
        }).catch(() => {
            Alert.alert("", "Internet connection require.", [
                { text: "Ok"}
            ]);
        })
    }

    _signIn = async () => { 
        console.log("1")
        this.setState({showLoader: true});  
        this.setState({isApiError: false, apiMessage: ""});          
        try {
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
            if(userInfo){
                 console.log('user info',userInfo);
                let formData = new FormData();
                formData.append('oauth_uid', userInfo.user.id);
                formData.append('email', "");
                formData.append('phoneNumber', "");
                formData.append('google_email', userInfo.user.email);
                console.log("formData", formData)
                let response = await POST(endPoints.socialLogin, formData);
                
                if(response.ack == "2"){
                     console.log("2")
                    this.setState({isApiError: true, apiMessage: "Please wait..."});
                    this.setState({modalVisible: true});
                    this.setState({userInfo: userInfo});
                    this.setState({ 
                        email:"", 
                        phone:"", 
                        type:"", 
                        bankAccountNo:'',
                        bankName:'',
                    });
                    this.setState({showLoader: false});
                    this.setState({isApiError: false, apiMessage: ""});
                }
                else if (response.ack == '1') {
                     console.log("login success");
                    this.fetchUserData(response.details);
                } else {
                    console.log(response,"4")
                    this.setState({showLoader: false});
                    Alert.alert("", response.message, [
                        { text: "Ok"}
                    ]);
                }
            }
        } catch (error) {
            this.setState({showLoader: false});
            console.log(error.code)
        }
    };

    changeSecurity=()=>{
        this.setState({secureText: !this.state.secureText});
    }

    login=()=>{
        NetInfo().then(() => {
            this._logIn();

        }).catch(() => {
            Alert.alert("", "Internet connection require.", [
                { text: "Ok"}
            ]);
        })
    }

    _logIn = async () => {
        this.setState({ isApiError: false });
        
        if (this.state.username.trim() === '') {
        this.setState({isEmailError: true});
        this.refEmail.focus();
        return;
        } else {
        this.setState({isEmailError: false});
        }
        var phonenoRegx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (this.state.username.trim().match(Regex.VALID_EMAIL) || Number.isInteger(parseInt(this.state.username))) {
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
    
        if (this.state.password.trim() === '') {
            this.setState({isPasswordError: true});
            this.refPassword.focus();
            return;
        } else {
            this.setState({isPasswordError: false});
        }
    
        this.setState({
            isEmailError: false,
            isEmailValidationError: false,
            isPasswordError: false,
        });
    
        let formData = new FormData();
        if (this.state.username.trim().match(Regex.VALID_EMAIL)){
            formData.append('email', this.state.username);
        }else{
            formData.append('phoneNumber', this.state.username);
        }
        
        formData.append('password', this.state.password);
    
        this.setState({showLoader: true});
        let response = await POST(endPoints.logIn, formData);
        this.setState({showLoader: false});

         console.log(response);
        if (response.ack == '1') {
            this.fetchUserData(response.details);
        } else {
            this.setState({isApiError: true, apiMessage: response.message});
        }
    };


    // logoutWithFacebook = () => {
    //     LoginManager.logOut();
    //   };
    
    getInfoFromToken = token => {
        const PROFILE_REQUEST_PARAMS = {
          fields: {
            string: 'id,picture,first_name,last_name,email',
          },
        };
        const profileRequest = new GraphRequest(
          '/me',
          {token, parameters: PROFILE_REQUEST_PARAMS},
          (error, user) => {
            
            if (error) {
                this.setState({showLoader: false});
                Alert.alert("", "Login with facebook faliure.", [
                    { text: "Ok"}
                ]);
              console.log('login info has error: ' + error);
            } else {
                //console.log(user);return false;
               this.directFbLogin(user);
            }
          },
        );
        new GraphRequestManager().addRequest(profileRequest).start();
    };

    directFbLogin=async(user)=>{
        let formData = new FormData();
        formData.append('oauth_uid', user.id);
        formData.append('email', "");
        formData.append('phoneNumber', "");
        let response = await POST(endPoints.socialLogin, formData);
         console.log(response);
        // console.log(formData);
        
        if(response.ack == '2'){
            this.setState({isApiError: true, apiMessage: "Please wait..."});
            this.setState({modalVisible: true});
            this.setState({userInfo: user});
            this.setState({showLoader: false});

            this.setState({ 
                email:"", 
                phone:"", 
                type:"", 
                bankAccountNo:'',
                bankName:'',
            });
            this.setState({isApiError: false, apiMessage: ""});
        }
        else if (response.ack == '1') {
            this.fetchUserData(response.details);
        } else {
            this.setState({showLoader: false});
            Alert.alert("", response.message, [
                { text: "Ok"}
            ]);
        //this.setState({isApiError: true, apiMessage: response.message});
        }
    }

    fbloginValidation=()=>{
        var phonenoRegx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if(this.state.signuptype=="fb"){
            //console.log(Number.isInteger(parseInt(this.state.phone)))
            if(this.state.email!="" && this.state.phone!="" && this.state.type!=""){
                if (!this.state.email.trim().match(Regex.VALID_EMAIL)) {
                    this.setState({isDetailsError: true});
                    this.setState({modalError: "Invalid email."});
                    return;
                }else if(this.state.email.trim().match(Regex.VALID_EMAIL) && !Number.isInteger(parseInt(this.state.phone))){
                    this.setState({isDetailsError: true});
                    this.setState({modalError: "Invalid Phone number"});
                    return;
                }else if(this.state.email.trim().match(Regex.VALID_EMAIL) && Number.isInteger(parseInt(this.state.phone)) && this.state.phone.indexOf('0')!==0){
                    this.setState({isDetailsError: true});
                    this.setState({modalError: "Phone number should start with 0."});
                    return;
                }else if(this.state.email.trim().match(Regex.VALID_EMAIL) && Number.isInteger(parseInt(this.state.phone)) && this.state.phone.indexOf('0')==0 && !this.state.phone.substring(1).match(phonenoRegx)){
                    this.setState({isDetailsError: true});
                    this.setState({modalError: "Phone Number must be 10 digit."});
                    return;
                }else if(this.state.email.trim().match(Regex.VALID_EMAIL) && Number.isInteger(parseInt(this.state.phone)) && this.state.phone.indexOf('0')==0 && this.state.phone.substring(1).match(phonenoRegx)) {
                    if(this.state.type=='SP'){
                        if(this.state.bankAccountNo!="" && this.state.bankName!=""){
                            this.setState({isDetailsError: false});
                            this.fblogin();
                        } else {
                            this.setState({isDetailsError: true});
                            this.setState({modalError: "Please fill these required fields."});
                            return;
                        }
                    } else {
                        // this.setState({isDetailsError: false});
                        // this.setState({modalError: ""});
                        // console.log("success")
                        // return false;
                        this.setState({isDetailsError: false});
                        this.fblogin();
                    }
                    
                }
                    
            }else{
                this.setState({isDetailsError: true});
                this.setState({modalError: "Please fill these required fields."});
                return;
            }
        }

        if(this.state.signuptype=="google"){
            if(this.state.phone!="" && this.state.type!=""){
                //console.log(Number.isInteger(parseInt(this.state.phone)))
                if(this.state.type!="" && !Number.isInteger(parseInt(this.state.phone))){
                    this.setState({isDetailsError: true});
                    this.setState({modalError: "Invalid Phone"});
                    return;
                }else if(this.state.type!="" && Number.isInteger(parseInt(this.state.phone)) && this.state.phone.indexOf('0')!==0){
                    this.setState({isDetailsError: true});
                    this.setState({modalError: "Phone number should start with 0."});
                    return;
                }else if(this.state.type!="" && Number.isInteger(parseInt(this.state.phone)) && this.state.phone.indexOf('0')==0 && !this.state.phone.substring(1).match(phonenoRegx)){
                    this.setState({isDetailsError: true});
                    this.setState({modalError: "Phone Number must be 10 digit."});
                    return;
                }else if(this.state.type!="" && Number.isInteger(parseInt(this.state.phone)) && this.state.phone.indexOf('0')==0 && this.state.phone.substring(1).match(phonenoRegx)) {
                    if(this.state.type=='SP'){
                        if(this.state.bankAccountNo!="" && this.state.bankName!=""){
                            this.setState({isDetailsError: false});
                            this.fblogin();
                        } else {
                            this.setState({isDetailsError: true});
                            this.setState({modalError: "Please fill these required fields."});
                            return;
                        }
                    } else {
                        // this.setState({isDetailsError: false});
                        // this.setState({modalError: ""});
                        // console.log("success")
                        // return false;
                        this.setState({isDetailsError: false});
                        this.fblogin();

                    }
                }                             
            }else{
                this.setState({isDetailsError: true});
                this.setState({modalError: "Please fill these required fields."});
                return;
            }
        }
    }

    fblogin=async()=>{
        this.setState({isApiError: false, apiMessage: ""});
        this.setState({modalVisible: false}); 
        //  console.log('result:', this.state.userInfo);
        //  return false; 
        this.setState({showLoader: true});
        let formData = new FormData();
        if(this.state.signuptype=="fb"){
            formData.append('oauth_uid', this.state.userInfo.id);
            formData.append('signuptype', this.state.signuptype);
            formData.append('firstName', this.state.userInfo.first_name);
            formData.append('lastName', this.state.userInfo.last_name);
            formData.append('email', this.state.email!=""?this.state.email:this.state.userInfo.email);
            formData.append('phoneNumber', this.state.phone!=""?this.state.phone:"");
            formData.append('profilePicture', this.state.userInfo.picture.data.url);
        }
        if(this.state.signuptype=="google"){
            formData.append('oauth_uid', this.state.userInfo.user.id);
            formData.append('signuptype', this.state.signuptype);
            formData.append('firstName', this.state.userInfo.user.givenName);
            formData.append('lastName', this.state.userInfo.user.familyName);
            formData.append('email', this.state.userInfo.user.email);
            formData.append('phoneNumber', this.state.phone!=""?this.state.phone:"");
            formData.append('profilePicture', this.state.userInfo.user.photo);
        }

        formData.append('bankaccountno', this.state.bankAccountNo);
        formData.append('bankname', this.state.bankName);
        formData.append('type', this.state.type);

        let response = await POST(endPoints.socialLogin, formData);
        this.setState({showLoader: false});
         console.log(response)
         console.log(formData)
        if (response.ack == '1') {
            // console.log("login success");
            this.fetchUserData(response.details);
        } else {
            this.setState({isApiError: true, apiMessage: response.message});
        }
    }
    
    loginWithFacebook = () => {
        this.setState({showLoader: true});
        // Attempt a login using the Facebook login dialog asking for default permissions.
        LoginManager.logInWithPermissions(['public_profile']).then(
            login => {
                if (login.isCancelled) {
                    this.setState({showLoader: false});
                console.log('Login cancelled');
                } else {
                AccessToken.getCurrentAccessToken().then(data => {
                    const accessToken = data.accessToken.toString();
                    this.getInfoFromToken(accessToken);
                });
                }
            },
            error => {
                this.setState({showLoader: false});
                console.log('Login fail with error: ' + error);
            },
        );
    };

    toggleModal = () => {
        if(this.state.signuptype=="google" && this.state.modalVisible==true){
            this.signOut();
        }else{
            this.setState({modalVisible: !this.state.modalVisible});
        }
    };

    signOut = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            this.setState({
                modalVisible: false, 
                userInfo:{},
                signuptype:"", 
                oauth_uid:"", 
                email:"", 
                phoneNumber:"", 
                isDetailsError:false, 
                modalError:"",
                phone:"", 
                type:"", 
                bankAccountNo:'',
                bankName:'',
            });
        } catch (error) {
            console.error(error);
        }
    };

    fetchUserData = async (data) => {
        let formData = new FormData();
        formData.append('user_id', data.id);
        
        let response = await POST(endPoints.profileDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        if (response && response.ack && response.ack == 1) {
            store.dispatch(setUserDetails(response.details));

            await Store('userToken', data.token);
            await Store('userId', data.id);
            await Store('userType', data.type);
            await Store('loginStatus', 'true');
            this.props.navigation.navigate('Home');
        }
    };


    render() {
        //console.log(this.state.modalVisible, this.state.isApiError, this.state.apiMessage)
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar backgroundColor="transparent" barStyle="dark-content" />
                <Loader 
                    loading={this.state.showLoader} 
                />
                    
                <Modal isVisible={this.state.modalVisible}>
                    <View style={style.modalcenter}>
                        <TouchableOpacity style={style.closemodal} onPress={this.toggleModal}>
                            <Icon name="close-circle" color="#fb6400" size={30}  />
                        </TouchableOpacity>
                        <Text style={style.mheading}>Please provide other details</Text>
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
                        {this.state.signuptype=="fb"?
                        <View style={style.roundinput}>                            
                            <TextInput  
                                placeholder="Email" 
                                placeholderTextColor="#acacac" 
                                style={style.forminput}
                                //ref={ref => (this.refEmail = ref)}
                                onChangeText={text => this.setState({email: text})}
                                autoCapitalize = 'none'
                            />
                            <TouchableOpacity style={style.iconwrap}><Icon name="mail" color="#1cae81" size={22} /></TouchableOpacity>
                        </View>:<></>}

                        <View style={style.roundinput}>
                            <TextInput  
                                placeholder="Phone No." 
                                placeholderTextColor="#acacac" 
                                keyboardType='phone-pad'
                                style={style.forminput}
                                //ref={ref => (this.refPhone = ref)}
                                onChangeText={text => this.setState({phone: text})}
                            />
                            <TouchableOpacity style={style.iconwrap}><Icon name="ios-call" color="#1cae81" size={22} /></TouchableOpacity>
                        </View>

                        {this.state.type=="SP"?
                        <View>
                            <Text>Example: Abbey Mortgage Bank</Text>
                            <View style={style.roundinput}>
                                <TextInput  
                                    placeholder="Bank Name" 
                                    placeholderTextColor="#acacac" 
                                    // keyboardType='phone-pad'
                                    style={style.forminput}
                                    // ref={ref => (this.refBankName = ref)}
                                    onChangeText={text => this.setState({bankName: text})}
                                />
                                <TouchableOpacity style={style.iconwrap}><Icon name="ios-lock-closed" color="#1cae81" size={22} /></TouchableOpacity>
                            </View>
                            <View style={style.roundinput}>
                                <TextInput  
                                    placeholder="Bank Account No." 
                                    placeholderTextColor="#acacac" 
                                    keyboardType='phone-pad'
                                    style={style.forminput}
                                    // ref={ref => (this.refBankAccountNo = ref)}
                                    onChangeText={text => this.setState({bankAccountNo: text})}
                                />
                                <TouchableOpacity style={style.iconwrap}><Icon name="ios-lock-closed" color="#1cae81" size={22} /></TouchableOpacity>
                            </View>
                            
                            
                        </View>
                        :<></>}
                        {this.state.isDetailsError && (
                            <Text style={style.errorMsgModal}>
                                {this.state.modalError}
                            </Text>
                        )}
                            
                        <TouchableOpacity style={style.whitebtn} onPress={this.fbloginValidation}>
                            <Text style={style.wbttext}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                   
                <KeyboardAvoidingView >
                    <ScrollView> 
                        <View style={style.container}>
                            <View style={styles.logotop}>
                                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                            </View>
                            <View style={[styles.loginbody, style.pB2]}>
                                <Text style={styles.ltext}> Sign in to continue </Text>

                                <View style={[style.mB2, style.pT2]}>

                                    {this.state.isApiError && (
                                        <Text style={styles.errorMsg}>
                                            {this.state.apiMessage}
                                        </Text>
                                    )}
                                    <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="Email Or Phone" 
                                            placeholderTextColor="#acacac" 
                                            style={style.forminput}
                                            ref={ref => (this.refEmail = ref)}
                                            onChangeText={text => this.setState({username: text})}
                                            autoCapitalize = 'none'
                                        />
                                        <TouchableOpacity style={style.iconwrap}><Icon name="mail" color="#1cae81" size={22} /></TouchableOpacity>
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
                                    <View style={style.roundinput}>
                                        <TextInput  
                                            placeholder="Password" 
                                            placeholderTextColor="#acacac" 
                                            secureTextEntry={this.state.secureText}
                                            style={style.forminput}
                                            autoCapitalize = 'none'
                                            ref={ref => (this.refPassword = ref)}
                                            onChangeText={text => this.setState({password: text})}
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

                                    <View style={styles.fpass}>
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('ForgotPassword')}>
                                            <Text style={styles.forgottext}>Forgot Password ?</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={style.pB4}>
                                    <Text style={styles.stext}>Sign in with</Text>
                                    <View style={style.flexRow}>
                                        <TouchableOpacity style={style.mR1} onPress={()=>{this.signin('fb')}}>
                                            <Image source={require('../../assets/images/facebook.png')} style={styles.slogo}  />      
                                        </TouchableOpacity>
                                         <TouchableOpacity style={style.mL1} onPress={()=>{this.signin('google')}}>
                                            <Image source={require('../../assets/images/google.png')} style={styles.slogo} />      
                                        </TouchableOpacity>
                                    </View>
                                </View>


                                    <TouchableOpacity style={[style.themebtn]} onPress={() => this.login()}> 
                                        <Text style={style.btntext}>Log In</Text>
                                    </TouchableOpacity>
                                    
                                    <View style={style.rowCenter}>
                                        <Text style={styles.logtext}>New User? </Text>
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('SignUp')}>
                                            <Text style={[styles.logtext, style.linktext]}>Sign Up</Text>
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

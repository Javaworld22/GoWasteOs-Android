import React, { Component } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView, SafeAreaView, StatusBar, Modal,Alert,ActivityIndicator,Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST,payStackPublickey,testPaystackCallBackURL} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import { NavigationEvents } from 'react-navigation';
import store from "../../components/redux/store/index";
import { WebView } from 'react-native-webview';

import RNPaystack from 'react-native-paystack';
RNPaystack.init({ publicKey: payStackPublickey });


export default class MakePayment extends Component {
    constructor(props){
        super(props);  
        this.state = {
            bookingId: this.props.navigation.state.params.bookingId,
            showLoader: false,
            showDetails: false,
            usertype: "",
            userEmail: "",
            serviceCharge: 0,
            municipalityCharge: 0,
            totalCharge: 0,
            userSubAccount: "",
            cardNumber: "",
            cardExpMonth: "",
            cardExpYear: "",
            cardCvv: "",
            isNumberError: false,
            isExpMonthError: false,
            isExpYearError: false,
            isCvvError: false,
            onlinePayment: false,
            cashPayment: false,
            paymentMethod:'',
            selectPayment:true,

            showModal:false,
            isModalLoading:true,
            authurl:''
        };   
    }

    componentDidMount = async () => {
        this.setState({
            usertype: await Retrieve('userType'),
            userEmail: store.getState().userDetails.email?store.getState().userDetails.email:'test@test.com',
        });
        this.getBookingDetails();
    };

    getBookingDetails=async()=>{
        let formData = new FormData();
        formData.append('booking_id', this.state.bookingId);
        formData.append('user_id', await Retrieve("userId"));
        this.setState({showLoader: true});
        let response = await POST(endPoints.bookingDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        
        if (response.details.ack == '1') {
            this.setState({
                serviceCharge: response.details.bookings_details.service_charge,
                municipalityCharge: response.details.bookings_details.municipality_charge,
                totalCharge: response.details.bookings_details.total_amount,
                userSubAccount: response.details.bookings_details.provider.sub_account_id,
            },
                () => {
                    this.setState({showDetails:true});
                }
            );
        }
    }
    
    chargeCard = () => {
        this.setState({showLoader: true});
        var chargeamount = this.state.totalCharge * 100;
        // console.log(chargeamount);
        RNPaystack.chargeCard({
            cardNumber: this.state.cardNumber, 
            expiryMonth: this.state.cardExpMonth, 
            expiryYear: this.state.cardExpYear, 
            cvc: this.state.cardCvv,
            email: this.state.userEmail,
            amountInKobo: chargeamount,
            subAccount: this.state.userSubAccount,
        })
        .then(response => {
            this.setState({showLoader: false});
            // console.log(response);
            this.submitTransactionDetails(response.reference);
        })
        .catch(error => {
            this.setState({showLoader: false});
            // console.log(error);
            // console.log(error.message);
            // console.log(error.code);
            Alert.alert("", error.message, [
                { text: "Ok"}
            ]);
        })
        
    }

    submitPayment = async() => {
        if (this.state.cardNumber === '') {
            this.setState({isNumberError: true});
            this.refNumber.focus();
            return;
        } else {
            this.setState({isNumberError: false});
        }

        if (this.state.cardExpMonth === '') {
            this.setState({isExpMonthError: true});
            this.refExpMonth.focus();
            return;
        } else {
            this.setState({isExpMonthError: false});
        }

        if (this.state.cardExpYear === '') {
            this.setState({isExpYearError: true});
            this.refExpYear.focus();
            return;
        } else {
            this.setState({isExpYearError: false});
        }

        if (this.state.cardCvv === '') {
            this.setState({isCvvError: true});
            this.refCvv.focus();
            return;
        } else {
            this.setState({isCvvError: false});
        }

        this.setState({
            isNumberError: false,
            isExpMonthError: false,
            isExpYearError: false,
            isCvvError: false,
        });

        Alert.alert("", "Are you sure?", [
            {   text: "Cancel" },
            {
                text: "Yes",
                onPress: async () => { 
                    this.chargeCard();
                }
            }
        ]);
    }

    submitTransactionDetails = async(transaction_id) => {
        let formData = new FormData();
        formData.append('booking_id', this.state.bookingId);
        formData.append('user_id', await Retrieve("userId"));
        formData.append('transaction_id', transaction_id);
        formData.append('payment_method', this.state.paymentMethod);
        formData.append('created_date', moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        this.setState({showLoader: true});
        let response = await POST(endPoints.addTransactionDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        
        if (response.details.ack == '1') {
            this.props.navigation.navigate('PaymentSuccess',{'amount':this.state.totalCharge})
        }
    }

    selectPayment = (value) => {
        if(value === 'cash'){
            Alert.alert("", "Are you sure?", [
                {   text: "Cancel" },
                {
                    text: "Yes",
                    onPress: async () => { 
                        this.setState({
                            onlinePayment:false,
                            paymentMethod:'Cash',
                        },
                            ()=>{
                                let transid = 'CASHPAYMENT-'+ this.state.bookingId;
                                this.submitTransactionDetails(transid);
                            }
                        );
                    }
                }
            ]);
            
        } else {
            this.setState({
                onlinePayment:true,
                selectPayment:false,
                paymentMethod:'Online',
            });
        }
    }

    getSplitAuthUrl = async() => {
        let formData = new FormData();
        formData.append('email', 'test@test.com');
        formData.append('amount', 100);
        formData.append('subaccount', 'ACCT_5478hs6gh7rrlnf');
        
        this.setState({showLoader: true});
        let response = await POST(endPoints.createSpiltPaymentsUrl, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        console.log(response.details.data)
        if (response.details.ack == '1') {
            // this.setState({
            //     showModal:true,
            //     authurl:response.details.data.authorization_url
            // });
            Linking.openURL(response.details.data.authorization_url);
            
        } else {
            Alert.alert("", response.details.message, [
                { text: "Ok"}
            ]);
        }
    }

    
    onNavigationStateChange = state => {
        // console.log(state.url);
        
        if (!state.url) return;
        if (state.url != testPaystackCallBackURL) {
            this.props.navigation.navigate('PaymentSuccess',{'amount':this.state.totalCharge});
        }
    };

    

    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Payment"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />

                <Modal
                    style={{ flex: 1 }}
                    visible={this.state.showModal}
                    animationType="slide"
                    transparent={false}
                >
                    <SafeAreaView style={{ flex: 1 }}>
                        <WebView
                            style={{ marginTop: 40 }}
                            source={{ uri: this.state.authurl }}
                            onLoadEnd={() => this.setState({isModalLoading:false})}
                            onNavigationStateChange={ this.onNavigationStateChange }
                        />
                    </SafeAreaView>
                    {this.state.isModalLoading?
                        <View>
                            <ActivityIndicator
                                size="large"
                                color="green"
                            />
                        </View>
                    :
                    <View style={{alignItems:"center"}}>
                        <TouchableOpacity 
                            style={styles.paycancelbtn} 
                            onPress={() => this.setState({showModal:false})}
                        >
                            <Text >Cancel Payment & Go Back</Text>
                        </TouchableOpacity>
                    </View>
                    }
                    
                </Modal>
            
                    <ScrollView>
                        <View style={style.container}> 
                            <View style={style.mB2}>
                                <Text style={styles.logtext}>Pay Amount: ₦{this.state.totalCharge}</Text>
                            </View>

                            {this.state.selectPayment &&
                            <View style={{flex:1,flexDirection:'row',justifyContent:"space-between"}}>
                                <TouchableOpacity 
                                    style={styles.paymentbtn}
                                    onPress={() => this.selectPayment('online')}
                                >
                                    <Text style={[style.btntext,{textAlign:"center"}]}>Online Payment</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.cashpaymentbtn}
                                    onPress={() => this.selectPayment('cash')}
                                >
                                    <Text style={[style.btntext,{textAlign:"center"}]}>Cash Payment</Text>
                                </TouchableOpacity> 
                            </View>
                            }

                                <TouchableOpacity 
                                    style={styles.cashpaymentbtn}
                                    onPress={() => this.getSplitAuthUrl()}
                                >
                                    <Text style={[style.btntext,{textAlign:"center"}]}>url</Text>
                                </TouchableOpacity>

                                

                            { this.state.onlinePayment &&
                            <View>
                                <Text style={styles.logtext}>Card Details</Text>
                                <View style={style.mT2}>
                                    <View style={[style.width100, style.pT1]}>
                                        <View style={style.mB2}>
                                            <Text style={style.formlabel}>Card Number</Text>
                                            <View style={style.roundinput}>
                                                <TextInput  
                                                    placeholder="xxxx xxxx xxxx xxxx" 
                                                    placeholderTextColor="#acacac" 
                                                    style={style.forminput}
                                                    keyboardType='phone-pad'
                                                    maxLength={16}
                                                    value = {this.state.cardNumber}
                                                    ref={ref => (this.refNumber = ref)}
                                                    onChangeText={text =>this.setState({ cardNumber: text })}
                                                />
                                                <Icon name="ios-card" color="#1cae81" size={22} />
                                            </View>
                                            {this.state.isNumberError && (
                                                <Text style={style.errorMsg}>
                                                    This field is required
                                                </Text>
                                            )}
                                        </View>
                                        <View style={style.row}>
                                            <View style={style.width50}>
                                                <Text style={style.formlabel}>Expiry Month</Text>
                                                <View style={style.roundinput}>
                                                    <TextInput  
                                                        placeholder="01" 
                                                        placeholderTextColor="#acacac" 
                                                        style={style.forminput2}
                                                        keyboardType='phone-pad'
                                                        maxLength={2}
                                                        value = {this.state.cardExpMonth}
                                                        ref={ref => (this.refExpMonth = ref)}
                                                        onChangeText={text =>this.setState({ cardExpMonth: text })}
                                                    />
                                                    <Icon name="ios-calendar" color="#1cae81" size={22} />
                                                </View>
                                                {this.state.isExpMonthError && (
                                                    <Text style={style.errorMsg}>
                                                        This field is required
                                                    </Text>
                                                )}
                                            </View>
                                            <View style={style.width50}>
                                                <Text style={style.formlabel}>Expiry Year</Text>
                                                <View style={style.roundinput}>
                                                    <TextInput  
                                                        placeholder="22" 
                                                        placeholderTextColor="#acacac" 
                                                        style={style.forminput2}
                                                        keyboardType='phone-pad'
                                                        maxLength={2}
                                                        value = {this.state.cardExpYear}
                                                        ref={ref => (this.refExpYear = ref)}
                                                        onChangeText={text =>this.setState({ cardExpYear: text })}
                                                    />
                                                    <Icon name="ios-calendar" color="#1cae81" size={22} />
                                                </View>
                                                {this.state.isExpYearError && (
                                                    <Text style={style.errorMsg}>
                                                        This field is required
                                                    </Text>
                                                )}
                                            </View>
                                            
                                        </View>
                                        <View style={style.mB2}>
                                            <Text style={style.formlabel}>CVV</Text>
                                            <View style={style.roundinput}>
                                                <TextInput  
                                                    placeholder="123" 
                                                    placeholderTextColor="#acacac" 
                                                    style={style.forminput2}
                                                    keyboardType='phone-pad'
                                                    maxLength={3}
                                                    value = {this.state.cardCvv}
                                                    ref={ref => (this.refCvv = ref)}
                                                    onChangeText={text =>this.setState({ cardCvv: text })}
                                                />
                                                <Icon name="ios-lock-closed" color="#1cae81" size={22} />
                                            </View>
                                            {this.state.isCvvError && (
                                                <Text style={style.errorMsg}>
                                                    This field is required
                                                </Text>
                                            )}
                                        </View>
                                                                            
                                    </View>

                                    <TouchableOpacity 
                                        style={[style.themebtn, style.mT4]}
                                        onPress={() => this.submitPayment()}
                                    >
                                        <Text style={style.btntext}>Pay</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            }
                                                      
 
                        </View>
                    </ScrollView>
                
            </SafeAreaView>
            
        )
    }
}

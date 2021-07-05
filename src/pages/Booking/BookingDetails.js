import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image,Alert, ScrollView,TextInput } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './styles';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST, payStackPublickey} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import Modal from 'react-native-modal';
import StarRating from 'react-native-star-rating';
import { NavigationEvents } from 'react-navigation';
import store from "../../components/redux/store/index";
import RandomString from "../../components/RandomString";

import PaystackWebView from 'react-native-paystack-webview';

export default class JobDetails extends Component {
    constructor(props){
        super(props);  
        this.state = {
            bookingDetails: [],
            bookingId: this.props.navigation.state.params.bookingId,
            showLoader: false,
            showDetails: false,
            usertype: "",

            modalVisible:false,
            starCount:5,
            comment:"",
            to_id:"",
            isDetailsError:false,
            modalError:"",
            comment:"",
            is_reviwed:1,
            is_started:0,
            currentTime:moment(new Date()).format('HH:mm:ss'),
            currentDate:moment(new Date()).format('YYYY-MM-DD'),
            beforebookDateTime:"",
            afterbookDateTime:"",
            momentbookdatetime:"",
            currentDateTime:"",
            billname:"",
            billemail:"",
            billmobile:"",
            paymentSuccessModal:false,
        
        };   
    }

    componentDidMount = async () => {
        this.setState({
            usertype : await Retrieve('userType'),
            billname : store.getState().userDetails.firstName+' '+store.getState().userDetails.lastName,
            billemail : store.getState().userDetails.email?store.getState().userDetails.email:'test@gmail.com',
            billmobile : store.getState().userDetails.phoneNumber?store.getState().userDetails.phoneNumber:'',
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
        // console.log(response.details.bookings_details);
        if (response.details.ack == '1') {
            this.setState({
                bookingDetails: response.details.bookings_details,
                to_id: await Retrieve("userType")=="C"?response.details.bookings_details.provider.id:response.details.bookings_details.customer.id,
                is_reviwed:response.details.is_reviewed,
                is_started:response.details.is_started,
            },
                () => {
                    var currentDateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    var momentbookdatetime = moment.utc(response.details.bookings_details.booking_date_time).format('YYYY-MM-DD HH:mm:ss');
                    var beforebookDateTime = moment.utc(response.details.bookings_details.booking_date_time).add(-2, 'hours').format('YYYY-MM-DD HH:mm:ss');
                    var afterbookDateTime = moment.utc(response.details.bookings_details.booking_date_time).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss');
                    
                    this.setState({
                        showDetails:true,
                        currentDateTime:currentDateTime,
                        beforebookDateTime :beforebookDateTime,
                        afterbookDateTime :afterbookDateTime,
                        momentbookdatetime :momentbookdatetime,
                    });
                }
            );
        }
    }

    onStarRatingPress=(rating)=> {
        this.setState({
            starCount: rating
          });
    }

    rate=async()=>{
        if(this.state.comment!=""){
            this.setState({modalError: ""});            
            this.setState({isDetailsError: false});            
            let formData = new FormData();
            formData.append('from_id', await Retrieve("userId"));
            formData.append('to_id', this.state.to_id);
            formData.append('is_reviewer_customer', await Retrieve("userType")=="C"?1:0);
            formData.append('comment', this.state.comment);
            formData.append('rating', this.state.starCount);
            formData.append('booking_id', this.state.bookingId);
            this.setState({showLoader: true});
            let response = await POST(endPoints.addReview, formData, {
              Authorization: await Retrieve("userToken")
            });
            this.setState({ showLoader: false });
            
            if (response.details.ack == 1) {
                this.setState({
                    modalVisible: false,
                    isDetailsError: false,
                    modalError: ""
                },() => {
                    Alert.alert("", "Thank you for your review", [
                        { text: "Ok", onPress:()=>{this.props.navigation.navigate('UserProfileView',{userId: this.state.to_id})}}
                    ]);                   
                    }
                );                 
            } else {
                this.setState({isDetailsError: true});
                this.setState({modalError: response.details.message});
            }
        }else{
            this.setState({isDetailsError: true});
            this.setState({modalError: "Please leave your comment before submit"});
        }
    }

    toggleModal = () => {
      this.setState({modalVisible: !this.state.modalVisible});
    };

    _cancelBooking = async (id,customer_id) => {
        Alert.alert("", "Do you want to cancel this booking?", [
            { text: "Cancel" },
            {
              text: "Yes",
              onPress: async () => {

                    let formData = new FormData();
                    formData.append('customer_id', customer_id);
                    formData.append("id",id);
                    formData.append("todaysDate",moment().format('DD/MM/YYYY'));
                    formData.append("todaysTime",moment().format('hh:mm A'));
                    
                    this.setState({ showLoader: true });
                    let response = await POST(endPoints.bookingCancel, formData, {
                    Authorization: await Retrieve("userToken")
                    });
                    console.log(response)
                    this.setState({ showLoader: false });

                    if (response.ack == 1) {
                        Alert.alert("", response.message, [
                            { text: "Ok", onPress: () => this.props.navigation.navigate('BookingHistory')}
                        ]);
                    } else {
                        Alert.alert("", response.message, [
                            { text: "Ok"}
                        ]);
                    }
                
                }
            }
        ]);
        
    }

    _deleteBooking = async (id,customer_id) => {
        Alert.alert("", "Do you want to delete this booking?", [
            { text: "Cancel" },
            {
              text: "Yes",
              onPress: async () => {

                    let formData = new FormData();
                    formData.append('customer_id', customer_id);
                    formData.append("id",id);
                    
                    this.setState({ showLoader: true });
                    let response = await POST(endPoints.bookingDelete, formData, {
                    Authorization: await Retrieve("userToken")
                    });
                    this.setState({ showLoader: false });

                    if (response.details.ack == 1) {
                        Alert.alert("", response.details.message, [
                            { text: "Ok", onPress: () => this.props.navigation.navigate('BookingHistory')}
                        ]);
                    } else {
                        Alert.alert("", response.details.message, [
                            { text: "Ok"}
                        ]);
                    }
                
                }
            }
        ]);
        
    }

    gettransId = () =>{
        let transid = 'trx'+this.state.bookingId+'_'+RandomString(8);
        return transid;
    }

    submitProviderTransactionDetails = async(transaction_id) => {
        let formData = new FormData();
        formData.append('booking_id', this.state.bookingId);
        formData.append('user_id', await Retrieve("userId"));
        formData.append('transaction_id', transaction_id);
        formData.append('payment_method', 'Online');
        formData.append('created_date', moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        this.setState({showLoader: true});
        let response = await POST(endPoints.insertProviderTransaction, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        // console.log(response);
        if (response.details.ack == '1') {
            this.setState({paymentSuccessModal: true});
            setTimeout(() => {
                this.setState({
                    paymentSuccessModal: false,
                },()=>{this.getBookingDetails();});
            }, 5000);
        }
    }

      
    render() {
        const bookingDetails = this.state.bookingDetails
        // console.log(this.state.beforebookDateTime);
        // console.log(this.state.currentDateTime);
        // console.log(this.state.afterbookDateTime);
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                {bookingDetails.service_status === 'P' && (moment(bookingDetails.booking_date).format('YYYY-MM-DD')>moment().format('YYYY-MM-DD') || (moment(bookingDetails.booking_date).format('YYYY-MM-DD')==moment().format('YYYY-MM-DD') && moment(bookingDetails.booking_time.split('T')[1].split('+')[0], 'HH:mm:ss').format('HH:mm')>moment().format('HH:mm')))&& this.state.usertype=="C"?
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Booking Details"
                    isEdit={true}
                    bookingId={this.state.bookingId}
                />:
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Booking Details"
                    isEdit={false}
                />}

                <Loader 
                    loading={this.state.showLoader} 
                />

                <NavigationEvents
                    onDidFocus={() => this.getBookingDetails()}
                />

                <Modal isVisible={this.state.modalVisible}>
                    <View style={style.modalcenter}>
                        <TouchableOpacity style={style.closemodal} onPress={this.toggleModal}>
                            <Icon name="close-circle" color="#fb6400" size={30}  />
                        </TouchableOpacity>
                        <Text style={style.mheading}>Rate Us</Text>
                        <View style={[style.rowCenter, style.alignCenter ]}>
                        <StarRating
                                disabled={false}
                                maxStars={5}
                                rating={this.state.starCount}
                                fullStarColor={'#fbc201'}
                                selectedStar={(rating) => this.onStarRatingPress(rating)}
                            />
                        </View>
                        <View style={style.roundinput}>
                            <TextInput  
                                placeholder="Help us to grow with your review" 
                                placeholderTextColor="#acacac" 
                                style={style.forminput}
                                onChangeText={text =>this.setState({ comment: text })}
                                multiline={true}
                            />
                            
                        </View>
                        
                        {this.state.isDetailsError && (
                            <Text style={style.errorMsgModal}>
                                {this.state.modalError}
                            </Text>
                        )} 
                            
                        <TouchableOpacity style={style.whitebtn} onPress={this.rate}>
                            <Text style={style.wbttext}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

                <Modal 
                    isVisible={this.state.paymentSuccessModal}
                    onRequestClose={() => {
                        console.log('Modal has been closed.');
                    }}
                >
                    <View style={style.paymentsuccessmodalcenter}>

                        <View style={style.container}>
                            <View style={styles.logotop}>
                                <Image source={require('../../assets/images/thumbsup.png')} style={styles.logo} />
                            </View> 
                            <View style={styles.succbox}>
                                <Text style={styles.psheading}>Success!</Text>
                                <Text style={styles.price}>You’ve just paid </Text>
                                <Text style={styles.pricevalue}>₦{this.state.bookingDetails.municipality_charge}</Text>
                            </View>
                            
                        </View>                          

                        <TouchableOpacity 
                            style={styles.okbtn}
                            onPress = {()=> {
                                this.setState({paymentSuccessModal:false},
                                ()=>{
                                    this.getBookingDetails();
                                })
                            }}
                        >
                            <Text style={{color:'white'}}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

                <ScrollView>
                    <View style={style.container}>
                    
                        {this.state.showDetails && bookingDetails ?

                            <View>
                                <View style={style.mT2}>                            
                                    <View style={style.card}>
                                        <View style={style.cardbody}>
                                            <View style={styles.inbody}>
                                                <Text style={styles.grtext}>{bookingDetails.service.title}</Text> 
                                                {this.state.usertype=="C"?
                                                <>
                                                <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                                                
                                                    <TouchableOpacity  onPress={() => this.props.navigation.navigate('UserProfileView',{userId: bookingDetails.provider.id})}>
                                                        <Text style={styles.label}>Service Provider:</Text>
                                                        <View style={styles.rowavt}   >
                                                            <View style={styles.avt}>
                                                                <Image source={{ uri: bookingDetails.provider.profilePicture }} style={{ width: 45, height: 45 , borderRadius: 45/ 2}} />
                                                            </View>
                                                            <Text style={styles.prvtext}>{bookingDetails.provider.firstName+' '+bookingDetails.provider.lastName}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                    <View style={{flexDirection:"column",}}>
                                                        {this.state.is_started === 1 && bookingDetails.service_status === 'P' &&
                                                        <View style={{paddingBottom:5}}>
                                                            <TouchableOpacity  
                                                                onPress={() => this.props.navigation.navigate('Tracking',{
                                                                                                                'bookingId':bookingDetails.id,
                                                                                                                'lat':bookingDetails.lattitude,
                                                                                                                'long':bookingDetails.longitude,
                                                                                                            })} 
                                                                style={[style.smbtn, {backgroundColor:'#fb6400',}]}
                                                            >
                                                                <Text style={style.smbtntext}>Tracking</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        }
                                                        
                                                        {(moment(bookingDetails.booking_date).format('YYYY-MM-DD')<moment().format('YYYY-MM-DD') && this.state.usertype=="C" && bookingDetails.service_status === 'C' && this.state.is_reviewed==0)?
                                                        <View>
                                                            <TouchableOpacity  
                                                                onPress={this.toggleModal}
                                                                style={[style.smbtn,{backgroundColor:'#fb6400',}]}  
                                                            >
                                                                <Text style={style.smbtntext}>Rate provider</Text>
                                                            </TouchableOpacity>
                                                        </View>:null}

                                                    </View>
                                                    

                                                </View>
                                                </>
                                                :<>
                                                <Text style={styles.label}>Customer:</Text>   
                                                <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                                                    <TouchableOpacity  onPress={() => this.props.navigation.navigate('UserProfileView',{userId: bookingDetails.customer.id})}>
                                                        <View style={styles.rowavt}>
                                                            <View style={styles.avt}>
                                                                    <Image source={{ uri: bookingDetails.customer.profilePicture }} style={{ width: 45, height: 45 , borderRadius: 45/ 2}} />
                                                            </View>
                                                            <Text style={styles.prvtext}>{bookingDetails.customer.firstName+' '+bookingDetails.customer.lastName}</Text>
                                                        </View>
                                                    </TouchableOpacity>

                                                    { bookingDetails.service_status === 'P' &&
                                                    <View style={{paddingBottom:5}}>
                                                        { (this.state.beforebookDateTime < this.state.currentDateTime && this.state.afterbookDateTime > this.state.currentDateTime) ?
                                                        <TouchableOpacity  
                                                            onPress={() => this.props.navigation.navigate('Tracking',{
                                                                                            'bookingId':this.state.bookingDetails.id,
                                                                                            'lat':this.state.bookingDetails.lattitude,
                                                                                            'long':this.state.bookingDetails.longitude,
                                                                    })} 
                                                            style={[style.smbtn, {backgroundColor:'#fb6400',}]}
                                                        >
                                                            <Text style={style.smbtntext}>Start Trip</Text>
                                                        </TouchableOpacity>
                                                        :<></>}
                                                    </View>
                                                    }
                                                </View>
                                                                                
                                                </>

                                                }   


                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                            <Icon name="arrow-forward-circle-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={[styles.prvtext],{width:'85%'}}>Booking Id: {bookingDetails.view_id}</Text>
                                                </View>
                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                            <Icon name="hourglass-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={[styles.prvtext],{width:'85%'}}>Service Status: {bookingDetails.service_status=="P"?"Pending":bookingDetails.service_status=="C&R"?"Cancel & Refunded":"Complete"}</Text>
                                                </View>
                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                        <Icon name="location-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={[styles.prvtext],{width:'85%'}}>Location: {bookingDetails.service_loaction}</Text>
                                                </View>
                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                    <Icon name="calendar-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={styles.prvtext}>Date: {moment(bookingDetails.booking_date).format('MMMM Do YYYY')}</Text>
                                                </View>
                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                    <Icon name="md-time-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={styles.prvtext}>Time: {moment.utc(bookingDetails.booking_time).format('hh:mm A')}</Text>
                                                </View>
                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                    <Icon name="information-circle-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={styles.prvtext}>Waste Size: {bookingDetails.waste_size+' '+bookingDetails.service.unit}</Text>
                                                </View>
                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                            <Icon name="cash-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={[styles.prvtext],{width:'85%'}}>Service Charge: ₦ {bookingDetails.service_charge}</Text>
                                                </View>
                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                            <Icon name="cash-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={[styles.prvtext],{width:'85%'}}>Municipality Charge: ₦ {bookingDetails.municipality_charge}</Text>
                                                </View>
                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                            <Icon name="cash-outline" color="#fb6400" size={25} />
                                                    </View>
                                                    <Text style={[styles.prvtext],{width:'85%'}}>Total Charge: ₦ {bookingDetails.total_amount}</Text>
                                                </View>

                                                <View style={styles.rowavt}>
                                                    <View style={styles.avticon}>
                                                        <Icon name="cash" color="#fb6400" size={25} />
                                                    </View> 
                                                    <Text style={[styles.prvtext],{width:'85%'}}>Payment Status: {bookingDetails.payment_status==0?"Unpaid":"Paid"}</Text>
                                                </View>
                                            </View>
                                            
                                        </View>

                                        <View style={{flexDirection:'row',justifyContent:"space-between",padding:10}}>
                                        </View>
                                    </View>

                                    <View>
                                        {bookingDetails.service_status === 'P' && (moment(bookingDetails.booking_date).format('YYYY-MM-DD')>moment().format('YYYY-MM-DD') || (moment(bookingDetails.booking_date).format('YYYY-MM-DD')==moment().format('YYYY-MM-DD') && moment(bookingDetails.booking_time.split('T')[1].split('+')[0], 'HH:mm:ss').add(-2, 'hours').format('HH:mm')>moment().format('HH:mm')))&& this.state.usertype=="C"?
                                        <TouchableOpacity style={style.rejctbtn} onPress={() => this._cancelBooking(bookingDetails.id,bookingDetails.customer_id)}>
                                            <Text style={style.btntext}>Cancel Booking</Text>
                                        </TouchableOpacity>:null
                                        }
                                    </View>

                                    <View>
                                        {(bookingDetails.service_status == 'C' &&  this.state.usertype=="C" && bookingDetails.payment_status==0)?
                                        <TouchableOpacity 
                                            style={style.themebtn} 
                                            onPress = {()=> this.props.navigation.navigate('MakePayment',{'bookingId':bookingDetails.id})}
                                        >
                                            <Text style={style.btntext}>Make Payment</Text>
                                        </TouchableOpacity>:null
                                        }
                                    </View>

                                    <View>
                                        
                                        {(bookingDetails.service_status == 'C' &&  this.state.usertype=="SP" && bookingDetails.payment_status==1 && bookingDetails.municipality_charge_status=='Unpaid')?
                                        <PaystackWebView
                                            buttonText="Pay your Municipality Charge"
                                            textStyles = {style.btntext}
                                            btnStyles= {style.themebtn}
                                            showPayButton={true}
                                            paystackKey={payStackPublickey}
                                            amount={bookingDetails.municipality_charge}
                                            billingEmail={this.state.billemail}
                                            billingMobile={this.state.billmobile}
                                            billingName={this.state.billname}
                                            ActivityIndicatorColor="green"
                                            SafeAreaViewContainer={{marginTop: 5}}
                                            SafeAreaViewContainerModal={{marginTop: 5}}
                                            onSuccess={(tranRef)=>{
                                                // console.log(tranRef.transactionRef.reference);
                                                this.submitProviderTransactionDetails(tranRef.transactionRef.reference);
                                            }}
                                            onCancel={()=>{console.log('something went wrong')}}
                                            autoStart={false}
                                            refNumber={this.gettransId()}
                                            
                                        />
                                        :null
                                        }
                                    </View>    

                                    <View>
                                        {(bookingDetails.service_status === 'C' &&  this.state.usertype=="SP" && this.state.is_reviewed==0)?
                                        <TouchableOpacity style={style.themebtn} onPress={this.toggleModal}>
                                            <Text style={style.btntext}>Review Customer</Text>
                                        </TouchableOpacity>:null
                                        }
                                    </View>  

                                    <View>
                                        {(moment(bookingDetails.booking_date).format('YYYY-MM-DD')<moment().format('YYYY-MM-DD') && this.state.usertype=="C" && bookingDetails.payment_status==1)?
                                        <TouchableOpacity style={style.rejctbtn} onPress={() => this._deleteBooking(bookingDetails.id,bookingDetails.customer_id)}>
                                            <Text style={style.btntext}>Delete Booking</Text>
                                        </TouchableOpacity>:null
                                        }
                                    </View>


                                                                    
                                </View>
                                
                            </View>

                        :<Text>Details not available</Text>}
                    </View>
                </ScrollView>
            </SafeAreaView>
            
        )
    }
}

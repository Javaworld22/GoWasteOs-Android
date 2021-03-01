import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image,Alert, ScrollView,TextInput } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './styles';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import Modal from 'react-native-modal';
import StarRating from 'react-native-star-rating';
import { NavigationEvents } from 'react-navigation';
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
              };   
    }
    componentDidMount = async () => {
        
        this.setState({usertype: await Retrieve('userType')});
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
            this.setState({bookingDetails: response.details.bookings_details,
                to_id: await Retrieve("userType")=="C"?response.details.bookings_details.provider.id:response.details.bookings_details.customer.id,
                is_reviwed:response.details.is_reviewed
            },
                () => {
                    this.setState({showDetails:true});
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


      
    render() {
        const bookingDetails = this.state.bookingDetails
        
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
                <ScrollView>
                    <View >
                        <View style={style.container}>
                        <NavigationEvents
                        onDidFocus={() => 
                            this.getBookingDetails()
                        }
                        />

                            {this.state.showDetails && bookingDetails ?

                                <View>
                                    <View style={style.mT2}>                            
                                        <View style={style.card}>
                                            <View style={style.cardbody}>
                                                <View style={styles.inbody}>
                                                    <Text style={styles.grtext}>{bookingDetails.service.title}</Text> 
                                                    {this.state.usertype=="C"?
                                                    <>
                                                    <View style={{flexDirection:"row"}}>
                                                    
                                                    <TouchableOpacity  onPress={() => this.props.navigation.navigate('UserProfileView',{userId: bookingDetails.provider.id})}>
                                                    <Text style={styles.label}>Service Provider:</Text>
                                                    <View style={styles.rowavt}   >
                                                        <View style={styles.avt}>
                                                            <Image source={{ uri: bookingDetails.provider.profilePicture }} style={{ width: 45, height: 45 , borderRadius: 45/ 2}} />
                                                        </View>
                                                        <Text style={styles.prvtext}>{bookingDetails.provider.firstName+' '+bookingDetails.provider.lastName}</Text>
                                                    </View>
                                                    </TouchableOpacity>
                                                    {(moment(bookingDetails.booking_date).format('YYYY-MM-DD')<moment().format('YYYY-MM-DD') && this.state.usertype=="C" && bookingDetails.service_status === 'C' && this.state.is_reviewed==0)?
                                                    <View style={style.providerRating}>
                                                        <TouchableOpacity  onPress={this.toggleModal}  >
                                                            <Text style={style.providerRatingBtn}>Rate provider</Text>
                                                        </TouchableOpacity>
                                                    </View>:null
                                                    }


                                                    </View>
                                                    </>
                                                    :<>
                                                    <Text style={styles.label}>Customer:</Text>   
                                                    <TouchableOpacity  onPress={() => this.props.navigation.navigate('UserProfileView',{userId: bookingDetails.customer.id})}>
                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avt}>
                                                                <Image source={{ uri: bookingDetails.customer.profilePicture }} style={{ width: 45, height: 45 , borderRadius: 45/ 2}} />
                                                        </View>
                                                        <Text style={styles.prvtext}>{bookingDetails.customer.firstName+' '+bookingDetails.customer.lastName}</Text>
                                                    </View>
                                                    </TouchableOpacity>                             
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
                                                        <Text style={[styles.prvtext],{width:'85%'}}>Municipality Charge: ₦ {bookingDetails.payment.municipality_charge}</Text>
                                                    </View>
                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avticon}>
                                                                <Icon name="cash-outline" color="#fb6400" size={25} />
                                                        </View>
                                                        <Text style={[styles.prvtext],{width:'85%'}}>Total Charge: ₦ {bookingDetails.payment.total_amount}</Text>
                                                    </View>

                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avticon}>
                                                            <Icon name="cash" color="#fb6400" size={25} />
                                                        </View> 
                                                        <Text style={[styles.prvtext],{width:'85%'}}>Payment Status: {bookingDetails.payment_status==0?"Unpaid":"Paid"}</Text>
                                                        {/* <Text style={[styles.prvtext],{width:'85%'}}>Payment Status: {bookingDetails.booking_time.split('T')[1].split('+')[0]}</Text> */}
                                                    </View>
                                                </View>
                                                
                                            </View>

                                            <View style={{flexDirection:'row',justifyContent:"space-between",padding:10}}>
                                            </View>
                                        </View>

                                        <View>
                                            {bookingDetails.service_status === 'P' && (moment(bookingDetails.booking_date).format('YYYY-MM-DD')>moment().format('YYYY-MM-DD') || (moment(bookingDetails.booking_date).format('YYYY-MM-DD')==moment().format('YYYY-MM-DD') && moment(bookingDetails.booking_time.split('T')[1].split('+')[0], 'HH:mm:ss').format('HH:mm')>moment().format('HH:mm')))&& this.state.usertype=="C"?
                                            <TouchableOpacity style={style.rejctbtn} onPress={() => this._cancelBooking(bookingDetails.id,bookingDetails.customer_id)}>
                                                <Text style={style.btntext}>Cancel Booking</Text>
                                            </TouchableOpacity>:null
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
                                            {(moment(bookingDetails.booking_date).format('YYYY-MM-DD')<moment().format('YYYY-MM-DD') && this.state.usertype=="C")?
                                            <TouchableOpacity style={style.rejctbtn} onPress={() => this._deleteBooking(bookingDetails.id,bookingDetails.customer_id)}>
                                                <Text style={style.btntext}>Delete Booking</Text>
                                            </TouchableOpacity>:null
                                            }
                                        </View>   

                                                                     
                                    </View>
                                    
                                </View>

                            :<Text>Details not available</Text>}

                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
            
        )
    }
}

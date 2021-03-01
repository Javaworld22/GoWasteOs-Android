import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image,Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import { NavigationEvents } from 'react-navigation';

export default class BookingConfirmation extends Component {

    constructor(props){
        super(props);  
        this.state = {
            confirmDetails: [],
            confirmationId: this.props.navigation.state.params.confirmationId,
            showLoader: false,
            showDetails:false,
            usertype:'',
            isApiError: false,
            apiMessage: '',
          };   
    }

    componentDidMount = async () => {
        
        this.setState({usertype: await Retrieve('userType')});
        this._getDetails();
    };

    _getDetails = async () => {
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        formData.append('confirmation_id', this.state.confirmationId);
        
        this.setState({showLoader: true});
        let response = await POST(endPoints.confirmationDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        
        if (response.details.ack == '1') {
            this.setState({confirmDetails: response.details.confirmations},
                ()=>{this.setState({showDetails:true});}
            );
        }
    }

    _acceptRequest = async (confirmation_id) => {
        Alert.alert("", "Do you want to accept the confirmation?", [
            { text: "Cancel" },
            {
                text: "Yes",
                onPress: async () => {
                    let formData = new FormData();
                    formData.append('service_provider_id', await Retrieve("userId"));
                    formData.append("confirmation_id",confirmation_id);
                    formData.append("noti_date_time",moment().format('YYYY-MM-DD HH:mm:ss'));
                    // console.log("Response ", formData);
                
                    this.setState({ showLoader: true });
                    let response = await POST(endPoints.acceptConfirmationRequest, formData, {
                    Authorization: await Retrieve("userToken")
                    });
                    this.setState({ showLoader: false });

                     //console.log("Response ", response);
                
                    if (response.details.ack == 1) {
                        Alert.alert("", response.details.message, [
                            { text: "Ok", onPress: () => this._getDetails()}
                        ]);
                    } else {
                        Alert.alert("", response.details.message, [
                            { text: "Ok", onPress: () => this._getDetails()}
                        ]);
                    }
                }
            }
        ]);
    }

    _cancelRequest = async (confirmation_id) => {
        Alert.alert("", "Do you want to reject the confirmation?", [
            { text: "Cancel" },
            {
              text: "Yes",
              onPress: async () => {

                    let formData = new FormData();
                    formData.append('service_provider_id', await Retrieve("userId"));
                    formData.append("confirmation_id",confirmation_id);
                    formData.append("noti_date_time",moment().format('YYYY-MM-DD HH:mm:ss'));
                    // console.log("Response ", formData);
                
                    this.setState({ showLoader: true });
                    let response = await POST(endPoints.rejectConfirmationRequest, formData, {
                    Authorization: await Retrieve("userToken")
                    });
                    this.setState({ showLoader: false });

                     //console.log("Response ", response);
                
                    if (response.details.ack == 1) {
                        Alert.alert("", response.details.message, [
                            { text: "Ok", onPress: () => this._getDetails()}
                        ]);
                    } else {
                        Alert.alert("", response.details.message, [
                            { text: "Ok", onPress: () => this._getDetails()}
                        ]);
                    }
                
                }
            }
        ]);
        
    }

    _placeBooking = async (bid_id,job_id) => {
        let formData = new FormData();
        formData.append('customer_id', await Retrieve("userId"));
        formData.append("job_id",job_id);
        formData.append("bid_id",bid_id);
        formData.append("noti_date_time",moment().format('YYYY-MM-DD HH:mm:ss'));
        // console.log("Response ", formData);
    
        this.setState({ showLoader: true });
        let response = await POST(endPoints.confirmBooking, formData, {
        Authorization: await Retrieve("userToken")
        });
        this.setState({ showLoader: false });

        if (response.details.ack == 1) {
            Alert.alert("", response.details.message, [
                { text: "Ok", onPress: () => this.props.navigation.navigate('BookingHistory')}
            ]);
        } else {
            this.setState({
                isApiError: true, 
                apiMessage: response.details.message
            });
        }
    }

    

    render() {
        const confirmDetails = this.state.confirmDetails;
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Confirmation Details"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <NavigationEvents
                    onDidFocus={() => this._getDetails()}
                />
                <ScrollView>  
                    { this.state.showDetails &&                   
                    <View style={[style.container, style.mT2]}>                            
                        <View style={style.card}>
                            <View style={style.cardbody}>
                                <View style={styles.inbody}>
                                <Text style={styles.grtext}>{confirmDetails.services.title}</Text>                                      
                                

                                    {this.state.usertype === 'SP'?
                                   <>
                                    <View style={styles.rowavt}>
                                        <View style={styles.avt}>
                                            <Image source={{ uri: confirmDetails.customer.profilePicture }} style={{ width: 50, height: 50 , borderRadius: 50/ 2}} />
                                        </View>
                                        <Text style={styles.label}>{confirmDetails.customer.firstName+' '+confirmDetails.customer.lastName}</Text>
                                    </View>
                                   </>
                                    :
                                    <>
                                    <View style={styles.rowavt}>
                                        <View style={styles.avt}>
                                            <Image source={{ uri: confirmDetails.service_provider.profilePicture }} style={{ width: 50, height: 50 , borderRadius: 50/ 2}} />
                                        </View>
                                        <Text style={styles.label}>{confirmDetails.service_provider.firstName+' '+confirmDetails.service_provider.lastName}</Text>
                                    </View>
                                    </>
                                    }
                                <View style={styles.rowavt}>
                                    <View style={styles.avticon}>
                                        <Icon name="location" color="#fb6400" size={25} />
                                    </View>
                                    <Text style={[styles.prvtext],{width:'85%'}}>{confirmDetails.job.location}</Text>
                                </View>
                                <View style={styles.rowavt}>
                                    <View style={styles.avticon}>
                                        <Icon name="ios-list-circle" color="#fb6400" size={25} />
                                    </View>
                                    <Text style={styles.prvtext}>{confirmDetails.job.garbage_size+' '+confirmDetails.services.unit}</Text>
                                </View>
                                <View style={styles.rowavt}>
                                    <View style={styles.avticon}>
                                        <Icon name="ios-pricetags-outline" color="#fb6400" size={25} />
                                    </View>
                                    <Text style={styles.prvtext}> ₦{confirmDetails.bid.price}</Text>
                                </View>
                                <View style={styles.rowavt}>
                                    <View style={styles.avticon}>
                                    <Icon name="calendar" color="#fb6400" size={25} />
                                    </View>
                                    <Text style={styles.prvtext}>{moment(confirmDetails.job.date).format('MMMM Do YYYY')}</Text>
                                </View>
                                <View style={styles.rowavt}>
                                    <View style={styles.avticon}>
                                    <Icon name="md-time-outline" color="#fb6400" size={25} />
                                    </View>
                                    <Text style={styles.prvtext}>At {moment.utc(confirmDetails.job.time).format('hh:mm A')}</Text>
                                </View>
                            </View>
                            </View>
                        </View>   

                        {this.state.usertype === 'SP'?
                        <View>
                            {confirmDetails.bid.is_accepted === 0 ?
                            <View style={[style.divgap],{marginTop:"10%"}}>
                                <TouchableOpacity style={[style.themebtn, style.mT4]} onPress={() => this._acceptRequest(confirmDetails.id)}>
                                    <Text style={style.btntext}>Accept</Text>
                                </TouchableOpacity> 

                                <TouchableOpacity style={style.canclbtn} onPress={() => this._cancelRequest(confirmDetails.id)}>
                                    <Text style={style.btntext}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            <View style={[style.divgap],{marginTop:"10%"}}>
                                {confirmDetails.bid.is_accepted === 1 ?
                                
                                <Text style={{color:'#3ca874',fontSize:20,textAlign:"center"}}>Accepted</Text>
                                :
                                <Text style={{color:'red',fontSize:20,textAlign:"center"}}>Rejected</Text>
                                }
                            </View>
                            }
                        </View>
                        :
                        <View>
                            {confirmDetails.bid.is_accepted === 0 ?
                            <Text style={{color:'#fb6400',fontSize:20,textAlign:"center"}}>Pending</Text>
                            :
                            <View>
                                {confirmDetails.bid.is_accepted === 1 ?
                                <View>
                                    <Text style={{color:'#3ca874',fontSize:20,textAlign:"center"}}>Accepted</Text>

                                    {this.state.isApiError && (
                                        <Text style={style.errorMsg}>
                                            {this.state.apiMessage}
                                        </Text>
                                    )}
                                    {confirmDetails.job.is_booked === 0 &&
                                    <View style={[style.divgap],{marginTop:"10%"}}>
                                        <TouchableOpacity 
                                            style={[style.themebtn, style.mT4]} 
                                            onPress={() => this._placeBooking(confirmDetails.bid.id,confirmDetails.job.id)}
                                        >
                                            <Text style={style.btntext}>Place Booking</Text>
                                        </TouchableOpacity> 
                                    </View>
                                    }
                                </View>
                                :
                                <View style={[style.divgap],{marginTop:"10%"}}>
                                    <Text style={{color:'red',fontSize:20,textAlign:"center"}}>Rejected</Text>
                                </View>
                                }
                            </View>
                            }
                        </View>
                        }

                                                   
                    </View>
                    }
                </ScrollView>
            </SafeAreaView>
            
        )
    }
}

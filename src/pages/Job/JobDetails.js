import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import { NavigationEvents } from 'react-navigation';

export default class JobDetails extends Component {
    constructor(props){
            super(props);  
            this.state = {
                jobDetails: [],
                jobId: this.props.navigation.state.params.jobId,
                showLoader: false,
                showDetails: false,
                usertype: ""
              };   
    }
    componentDidMount = async () => {      
        this.setState({usertype: await Retrieve('userType')});
        this.getDetails();
    };

    getDetails=async()=>{
        let formData = new FormData();
        formData.append('job_id', this.state.jobId);       
        this.setState({showLoader: true});
        let response = await POST(endPoints.jobdetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        if (response.details.ack == '1') {
            this.setState({jobDetails: response.details.job_details},
                () => {
                    this.setState({showDetails:true});
                }
            );
        }
    }


      
    render() {
        const jobDetails = this.state.jobDetails
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Job Details"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <ScrollView>
                    <View >
                        <View style={style.container}>
                        <NavigationEvents
                        onDidFocus={() => 
                            this.getDetails()
                        }
                        />
                            {this.state.showDetails && jobDetails ?

                                <View>
                                    <View style={style.mT2}>                            
                                        <View style={style.card}>
                                            <View style={style.cardbody}>
                                                <View style={styles.inbody}>
                                                    <Text style={styles.grtext}>{jobDetails.service.title}</Text> 
                                                    <TouchableOpacity  onPress={() => this.props.navigation.navigate('UserProfileView',{userId: jobDetails.customer.id})}>
                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avt}>
                                                        <Image source={{ uri: jobDetails.customer.profilePicture }} style={{ width: 45, height: 45 , borderRadius: 45/ 2}} />
                                                        </View>
                                                        <Text style={styles.label}>{jobDetails.customer.firstName+' '+jobDetails.customer.lastName}</Text>
                                                    </View>
                                                    </TouchableOpacity>                                     
                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avticon}>
                                                                <Icon name="location" color="#fb6400" size={25} />
                                                        </View>
                                                        <Text style={[styles.prvtext],{width:'85%'}}>{jobDetails.location}</Text>
                                                    </View>
                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avticon}>
                                                                <Icon name="location" color="#fb6400" size={25} />
                                                        </View>
                                                        <Text style={[styles.prvtext],{width:'85%'}}>{jobDetails.city.name}</Text>
                                                    </View>
                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avticon}>
                                                        <Icon name="ios-list-circle" color="#fb6400" size={25} />
                                                        </View>
                                                        <Text style={styles.prvtext}>{jobDetails.garbage_size+' '+jobDetails.service.unit}</Text>
                                                    </View>
                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avticon}>
                                                        <Icon name="calendar" color="#fb6400" size={25} />
                                                        </View>
                                                        <Text style={styles.prvtext}>{moment(jobDetails.date).format('MMMM Do YYYY')}</Text>
                                                    </View>
                                                    <View style={styles.rowavt}>
                                                        <View style={styles.avticon}>
                                                        <Icon name="md-time-outline" color="#fb6400" size={25} />
                                                        </View>
                                                        <Text style={styles.prvtext}>At {moment.utc(jobDetails.time).format('hh:mm A')}</Text>
                                                        {/* <Text style={styles.prvtext}>At {jobDetails.time}</Text> */}
                                                    </View>
                                                </View>
                                                
                                            </View>

                                            <View style={{flexDirection:'row',justifyContent:"space-between",padding:10}}>
                                            { this.state.usertype == 'SP' &&
                                                <TouchableOpacity 
                                                    style={style.smbtn}
                                                    onPress={() => this.props.navigation.navigate('BidPost',{jobId: jobDetails.id})}
                                                >
                                                    <Text style={style.smbtntext}>Place Bid</Text>
                                                </TouchableOpacity>
                                            }

                                            { jobDetails.is_booked === 0 &&
                                                <TouchableOpacity 
                                                    style={style.smbtn}
                                                    onPress={() => this.props.navigation.navigate('BidHistory',{jobId: jobDetails.id})}
                                                >
                                                    <Text style={style.smbtntext}>Bid History</Text>
                                                </TouchableOpacity>
                                            }

                                            { jobDetails.booking_id !=null && jobDetails.is_booked === 1? 
                                                <TouchableOpacity 
                                                    style={style.smbtn}
                                                    onPress={() => this.props.navigation.navigate('BookingDetails',{bookingId: jobDetails.booking_id})}
                                                >
                                                    <Text style={style.smbtntext}>Booking Details</Text>
                                                </TouchableOpacity>:null
                                            }

                                            { jobDetails.booking_id ==null && jobDetails.is_booked === 0 && this.state.usertype=="C"? 
                                                <TouchableOpacity 
                                                    style={style.smbtn}
                                                    onPress={() => this.props.navigation.navigate('JobEdit',{jobId: jobDetails.id})}
                                                >
                                                    <Text style={style.smbtntext}>Edit Job</Text>
                                                </TouchableOpacity>:null
                                            }
                                            </View>
                                        </View>   

                                                                     
                                    </View>
                                    
                                </View>

                            :null}

                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
            
        )
    }
}

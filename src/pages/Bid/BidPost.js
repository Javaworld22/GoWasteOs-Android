import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, Platform,
    StatusBar, Image, ScrollView, Picker,TextInput, Alert,KeyboardAvoidingView } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import { dynamicImageURL, POST, endPoints } from "../../components/Api";
import { Retrieve } from "../../components/AsyncStorage";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";
import Loader from '../../components/Loader';


export default class BidPost extends Component {
    constructor(props){
        super(props); 
        this.state = {
            jobDetails: [],
            jobId: this.props.navigation.state.params.jobId,
            bidPrice:'',
            date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            isBidPriceError: false,
            isApiError: false,
            apiMessage: '',
            showLoader: false,
        };    
    }

    componentDidMount = async () => {

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

    _bidPost = async () => {
        this.setState({ isApiError: false });
    
        if (this.state.bidPrice === "") {
            this.setState({ isBidPriceError: true });
            this.refBidPrice.focus();
            return;
        } else {
            this.setState({ isBidPriceError: false });
        }
    
        this.setState({
            isBidPriceError: false,
            isApiError: false
        });
    
        let formData = new FormData();
        formData.append('service_provider_id', await Retrieve("userId"));
        formData.append("job_id",this.state.jobId);
        formData.append("price",this.state.bidPrice);
        formData.append("created_date",this.state.date);
        
        // console.log("Response ", formData);
    
        this.setState({ showLoader: true });
        let response = await POST(endPoints.bidPost, formData, {
          Authorization: await Retrieve("userToken")
        });
        this.setState({ showLoader: false });

        // console.log("Response ", response);
    
        if (response.details.ack == 1) {
            this.setState({ bidPrice: '' });
            Alert.alert("", "Bid posted successfully.", [
                { text: "Ok", onPress: () => this.props.navigation.navigate('BidHistory',{jobId:this.state.jobId})}
            ]);
        } else {
            this.setState({
                isApiError: true, 
                apiMessage: response.details.message
            });
        }
    };

    render() {
        const jobDetails = this.state.jobDetails
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Place Bid"
                />

                <Loader 
                    loading={this.state.showLoader} 
                />
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={style.container}
                >
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View >
                            
                        {this.state.showDetails && jobDetails ?
                            <View style={style.mT2}>

                                <View style={style.card}>
                                    <View style={style.cardbody}>
                                        <View style={styles.inbody}>
                                            <Text style={styles.grtext}>{jobDetails.service.title}</Text>                                      
                                            <View style={styles.rowavt}>
                                                <View style={styles.avt}>
                                                        <Icon name="person-circle-outline" color="#212121" size={25} />
                                                </View>
                                                <Text style={styles.label}>{jobDetails.customer.firstName+' '+jobDetails.customer.lastName}</Text>
                                            </View>
                                            <View style={styles.rowavt}>
                                                <View style={styles.avticon}>
                                                        <Icon name="location" color="#fb6400" size={25} />
                                                </View>
                                                <Text style={[styles.prvtext],{width:'85%'}}>{jobDetails.location}</Text>
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
                                            </View>

                                            {jobDetails.last_bid_price!=0 &&
                                            <View style={[styles.prwrap],{flexDirection:'row',paddingTop:5}}>
                                                <Text style={[styles.plabel],{fontSize:15,fontWeight:"bold",paddingRight:10}}>Last bid price :</Text>
                                                <Text>₦{jobDetails.last_bid_price}</Text>
                                            </View>
                                            } 
                                        </View>
                                        
                                    </View>
                                </View>
                                

                                <Text style={styles.label}>Bid Price</Text>
                                <View style={style.formControl}>
                                    <TextInput  
                                        placeholder="Bid price" 
                                        placeholderTextColor="#acacac" 
                                        keyboardType='phone-pad'
                                        style={style.formControlInput}
                                        value = {this.state.bidPrice}
                                        ref={ref => (this.refBidPrice = ref)}
                                        onChangeText={text =>this.setState({ bidPrice: text })}
                                    />
                                </View>
                                {this.state.isBidPriceError && (
                                        <Text style={style.errorMsg}>
                                            This field is required
                                        </Text>
                                    )}

                                
                                {this.state.isApiError && (
                                    <Text style={style.errorMsg}>
                                        {this.state.apiMessage}
                                    </Text>
                                )}

                                <View style={[style.mT4,style.pB5]}>
                                    <TouchableOpacity style={style.themebtn} onPress={() => this._bidPost()}>
                                        <Text style={style.btntext}>Place Bid</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        : null }

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        )
    }
}

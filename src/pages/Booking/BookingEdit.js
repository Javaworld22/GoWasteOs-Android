import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, 
    StatusBar, Image, ScrollView, TextInput, Alert,KeyboardAvoidingView } from 'react-native'
import { Picker } from '@react-native-community/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import { dynamicImageURL, POST, endPoints, googleApiKey } from "../../components/Api";
import { Retrieve } from "../../components/AsyncStorage";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";
import Loader from '../../components/Loader';
// import { LogBox } from 'react-native';

// LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

export default class JobEdit extends Component {
    constructor(props){
        super(props); 
        this.myRef = React.createRef();
        this.state = {
            bookingId:this.props.navigation.state.params.bookingId,
            citylist:[],
            servicelist:[],
            categorylist:[],
            city:0,
            service:0,
            category:0,
            size:'',
            address: '',
            lattitude:"",
            longitude:"",
            datestring: moment(new Date()).format('YYYY-MM-DD'),
            selectdate: new Date(),
            timestring:moment(new Date()).format('hh:mm:ss A'),
            selecttime:moment(new Date()).format('HH:mm:ss'),
            showDate: false,
            showTime: false,
            isCityError: false,
            isServiceError: false,
            isCategoryError: false,
            isSizeError: false,
            isAddressError: false,
            isPosting: false,
            isApiError: false,
            apiMessage: '',
            showLoader: false,
            sizeError:'This field is required',
            bookingDetails: [],
            service_provider_id: '',
        };    
    }
    componentDidMount = async () => {
        
        this.setState({usertype: await Retrieve('userType')});
        let formData = new FormData();
        formData.append('booking_id', this.state.bookingId);
        formData.append('user_id', await Retrieve("userId"));
        
        this.setState({showLoader: true});
        let response = await POST(endPoints.bookingDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});

        if (response.details.ack == '1') {
            this.setState({bookingDetails: response.details.bookings_details},
                () => {
                    this.setState({showDetails:true});
                    this.setState({service_provider_id:response.details.bookings_details.provider.id});
                    this.setState({city:response.details.bookings_details.city.id});
                    this.setState({service:response.details.bookings_details.service.id});
                    this.setState({category:parseInt(response.details.bookings_details.price_id)});
                    this.setState({size:response.details.bookings_details.waste_size});
                    this.setState({address:response.details.bookings_details.service_loaction});
                    this.setState({lattitude:response.details.bookings_details.lattitude});
                    this.setState({longitude:response.details.bookings_details.longitude});
                    this.setState({datestring:moment(response.details.bookings_details.booking_date).format('YYYY-MM-DD')});
                    this.setState({timestring:moment.utc(response.details.bookings_details.booking_time).format('hh:mm A')});
                    this.setState({selecttime:moment.utc(response.details.bookings_details.booking_time).format('HH:mm')});
                    this.myRef.current.setAddressText(response.details.bookings_details.service_loaction);
                }
            );
        }

        this._getCityList();
        this._getServiceList(response.details.bookings_details.city.id, 1);
        this._getCategoryList(response.details.bookings_details.service.id, 1);
    };

    _getCityList = async () => {
        this.setState({ showLoader: true });
        let response = await POST(endPoints.citylist, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({ showLoader: false });

        if (response.details.ack == 1) { 
            this.setState({citylist: response.details.cities});
        }
    };

    _getServiceList = async (cityid, chk) => {
        this.setState({city: cityid});
        if(chk==2){
            this.setState({service: 0});
            this.setState({category: 0});
        }
        let formData = new FormData();
        formData.append('city_id', cityid);
        let response = await POST(endPoints.cityServiceList, formData,{
            Authorization: await Retrieve("userToken")
        });

        if (response.details.ack == 1) { 
            this.setState({servicelist: response.details.services});
        }
        // console.log(response.details.services);
    };

    _getCategoryList = async (servid, chk) => {
        this.setState({service: servid});
        if(chk==2){
            this.setState({category: 0});
        }
        let formData = new FormData();
        formData.append('city_id', this.state.city);
        formData.append('service_id', servid);
        let response = await POST(endPoints.servicePriceList, formData,{
            Authorization: await Retrieve("userToken")
        });

        if (response.details.ack == 1) { 
            this.setState({categorylist: response.details.prices});
        }
        // console.log(response.details.prices);
    };

    _setDate = (event: any, selectedDate: any) => {
        // console.log(selectedDate);
        this.setState({
            datestring: moment(selectedDate).format('YYYY-MM-DD'), 
            selectdate: selectedDate,
            showDate:false
        });
    }

    _setTime = (event: any, selectedTime: any) => {
        // console.log(selectedTime);
        // console.log(moment(selectedTime).format('HH:mm:ss'));
        this.setState({
            timestring: moment(selectedTime).format('hh:mm A'), 
            selecttime: moment(selectedTime).format('HH:mm'),
            showTime:false
        });
    }

    setAddress = (data, details) => {
        console.log(details);
    }

    _jobPost = async () => {
        this.setState({ isApiError: false });
    
        if (this.state.city === '') {
            this.setState({isCityError: true});
            this.refCity.focus();
            return;
        } else {
            this.setState({isCityError: false});
        }

        if (this.state.service === '') {
            this.setState({isServiceError: true});
            this.refService.focus();
            return;
        } else {
            this.setState({isServiceError: false});
        }
    
        if (this.state.category == 0) {
            this.setState({ isCategoryError: true });
            this.refCategory.focus();
            return;
        } else {
            this.setState({ isCategoryError: false });
        }
    
        if (this.state.size === "") {
            this.setState({ isSizeError: true });
            this.refSize.focus();
            return;
        } else {
            var numbers = /^[0-9]+$/;
            if(this.state.size.match(numbers)){
                if(this.state.size>15000){
                    this.setState({ isSizeError: true });
                    this.setState({ sizeError: "Size should not be greater than 15000." });
                    this.refSize.focus();
                    return;
                }else{
                    this.setState({ isSizeError: false });
                }
            }else{
                this.setState({ isSizeError: true });
                this.setState({ sizeError: "Invalid waste size." });
                this.refSize.focus();
                return;
            }
        }

        if (this.state.address.trim() === "") {
            this.setState({ isAddressError: true });
            //this.refAddress.focus();
            return;
        } else {
            this.setState({ isAddressError: false });
        }

        if (this.state.datestring == moment(new Date()).format('YYYY-MM-DD') && this.state.selecttime<=moment(new Date()).format('HH:mm')) {
            this.setState({isApiError: true, apiMessage: "Past time is not acceptable."});
            return;
        } else {
            this.setState({ isApiError: false });
            this.setState({ apiMessage: "" });
        }
    
        this.setState({
            isCityError: false,
            isServiceError: false,
            isCategoryError: false,
            isSizeError: false,
            isAddressError: false,
            isApiError: false
        });

        // console.log(this.state)
        // return false;
    
        let formData = new FormData();
        formData.append('customer_id', await Retrieve("userId"));
        formData.append('service_provider_id', this.state.service_provider_id);
        formData.append('id', this.state.bookingId);
        formData.append("price_id",this.state.category);
        formData.append("waste_size",this.state.size);
        formData.append("service_loaction",this.state.address);
        // formData.append("lattitude","22.00");
        // formData.append("longitude","44.33");
        formData.append("lattitude",this.state.lattitude);
        formData.append("longitude",this.state.longitude);
        formData.append("booking_date",this.state.datestring);
        formData.append("booking_time",this.state.selecttime);
    
        this.setState({ showLoader: true });
        let response = await POST(endPoints.bookingEdit, formData, {
          Authorization: await Retrieve("userToken")
        });
        this.setState({ showLoader: false });

        console.log(response)

        if (response.details.ack == 1) {
            Alert.alert("", response.details.message, [
                { text: "Ok", onPress: () => this.props.navigation.navigate('BookingDetails',{bookingId: this.state.bookingId})}
            ]);
        } else {
            this.setState({isApiError: true, apiMessage: response.details.message});
        }
    };

    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Edit Booking"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <KeyboardAvoidingView>
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View style={style.container}>
                            
                            <View style={style.mT2}>
                                
                                {/* <Text style={styles.label}>City</Text> */}
                                <View style={style.roundinput}>
                                    <Picker
                                        style={[style.forminput],{width:'100%', height:40}}
                                        selectedValue={this.state.city}
                                        onValueChange={(itemValue, itemIndex) => this._getServiceList(itemValue, 2)}
                                    >
                                        <Picker.Item label="Select City" value="" />

                                        {this.state.citylist !== "" ? 
                                            this.state.citylist.map((citylist,key )=> {
                                            return <Picker.Item label={citylist.name} value={citylist.id} key={key}/>;
                                            })
                                         :
                                            <Picker.Item label="Loading..." value="0" />
                                        }
                                    </Picker>
                                </View>
                                {this.state.isCityError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )}

                                {/* <Text style={styles.label}>Service</Text> */}
                                <View style={style.roundinput}>
                                    <Picker
                                        style={[style.forminput],{width:'100%', height:40}}
                                        selectedValue={this.state.service}
                                        onValueChange={(itemValue, itemIndex) => this._getCategoryList(itemValue, 2)}
                                    >
                                        <Picker.Item label="Select Service" value="" />
                                        {this.state.servicelist !== "" && this.state.city!=0? 
                                            this.state.servicelist.map((servicelist,key) => {
                                            return <Picker.Item label={servicelist.title} value={servicelist.id} key={key} />;
                                            })
                                         :
                                            <Picker.Item label="Loading..." value="0" />
                                        }
                                    </Picker>
                                </View>
                                {this.state.isServiceError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )}

                                {/* <Text style={styles.label}>Category</Text> */}
                                <View style={style.roundinput}>
                                    <Picker
                                        style={[style.forminput],{width:'100%', height:40}}
                                        selectedValue={this.state.category}
                                        onValueChange={(itemValue, itemIndex) => this.setState({ category: itemValue })}
                                    >
                                        <Picker.Item label="Select Category" value="" />
                                        {this.state.categorylist !== "" && this.state.service!=0 && this.state.city!=0? 
                                            this.state.categorylist.map((categorylist,key) => {
                                            return <Picker.Item label={categorylist.category+' (₦ '+categorylist.price+'/'+categorylist.size+' Liters)'} value={categorylist.id} key={key} />;
                                            })
                                        :
                                            <Picker.Item label="Loading..." value="0" />
                                        }
                                    </Picker>
                                </View>
                                {this.state.isCategoryError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )}

                                {/* <Text style={styles.label}>Garbage Size</Text> */}
                                <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="Garbage Size" 
                                        placeholderTextColor="#acacac" 
                                        keyboardType='phone-pad'
                                        style={style.forminput}
                                        ref={ref => (this.refSize = ref)}
                                        onChangeText={text =>this.setState({ size: text })}
                                        defaultValue={this.state.size}
                                    />
                                </View>
                                {this.state.isSizeError && (
                                        <Text style={style.errorMsg}>
                                            {this.state.sizeError}
                                        </Text>
                                    )}

                                {/* <Text style={styles.label}>Address</Text> */}
                                <View style={style.roundinput}>
                                    {/* <TextInput  
                                        placeholder="Location" 
                                        placeholderTextColor="#acacac" 
                                        style={style.forminput}
                                        ref={ref => (this.refAddress = ref)}
                                        onChangeText={text =>this.setState({ address: text })}
                                    /> */}
                                    <GooglePlacesAutocomplete
                                    placeholder='Address'
                                    fetchDetails = {true}
                                    listViewDisplayed='auto' 
                                    ref={this.myRef}
                                    styles={{textInput: { height: 33 }}}
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
                                    
                                </View>
                                {this.state.isAddressError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )}

                                {/* <Text style={styles.label}>Select Date</Text> */}
                                <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="Select Date" 
                                        placeholderTextColor="#acacac" 
                                        editable={false}
                                        style={[style.formControlInput],{width:'50%', height:40}}
                                        defaultValue={this.state.datestring}
                                    />
                                    <TouchableOpacity 
                                        onPress = {()=> this.setState({showDate:true})}
                                        style={style.iconwrap}>
                                            <Icon name="ios-calendar-outline" color="#1cae81" size={22} />
                                    </TouchableOpacity>
                                    {this.state.showDate && (
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={this.state.selectdate}
                                            mode='date'
                                            is24Hour={true}
                                            display="default"
                                            onChange={this._setDate}
                                            minimumDate={new Date()}
                                        />
                                    )}
                                </View>
                                

                                {/* <Text style={styles.label}>Select Time</Text> */}
                                <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="Select Date" 
                                        placeholderTextColor="#acacac" 
                                        editable={false}
                                        style={[style.formControlInput],{width:'50%', height:40}}
                                        defaultValue={this.state.timestring}
                                    />
                                    <TouchableOpacity 
                                        onPress = {()=> this.setState({showTime:true})}
                                        style={style.iconwrap}>
                                            <Icon name="ios-calendar-outline" color="#1cae81" size={22} />
                                    </TouchableOpacity>
                                    {this.state.showTime && (
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={this.state.selectdate}
                                            mode='time'
                                            is24Hour={false}
                                            display="default"
                                            onChange={this._setTime}
                                        />
                                    )}
                                </View>
                                

                                {this.state.isApiError && (
                                    <Text style={style.errorMsg}>
                                        {this.state.apiMessage}
                                    </Text>
                                )}

                                <View style={[style.mT4,style.pB5]}>
                                    <TouchableOpacity style={style.themebtn} onPress={() => this._jobPost()}>
                                        <Text style={style.btntext}>Edit Booking</Text>
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


import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView,FlatList } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import store from "../../components/redux/store/index";
import Loader from '../../components/Loader';
import moment from "moment";
import { NavigationEvents } from 'react-navigation';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';



export default class Home extends Component {
    constructor(props){
            super(props);  
            this.state = {
                serviceProviderList: {},
                jobList: {},
                showLoader: false,
                userType:"",
                pageno: 1,
                isScroll:false,
              };   
    }
    componentDidMount = async() => {
        this.setState({userType: await Retrieve('userType')});             
        if(store.getState().userDetails && (store.getState().userDetails.lattitude =="" || store.getState().userDetails.longitude =="" || store.getState().userDetails.lattitude ==null || store.getState().userDetails.longitude ==null)){
            this.findCoordinates();
        }else{
            this.myFunction(); 
        }  

          
    };

    findCoordinates = async() => {
        /*LOCATION : */
        //Grant the permission for Location
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                'title': 'Location Permission',
                'message': 'GoWasteOs needs access to your location '
            })

        if (granted) {
            Geolocation.getCurrentPosition(
                (position) => {
                    //console.log("location", position.coords.latitude.toString(), position.coords.longitude.toString());
                    this.updateLatLong(position.coords.latitude.toString(),position.coords.longitude.toString());
                },
                (error) => {
                    // See error code charts below.
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );              
            this.watchID = Geolocation.watchPosition((lastPosition) => {
            });
        }
        //----LOCATION END----//
    };

    updateLatLong=async(lat,long)=>{
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        formData.append('lattitude', lat);
        formData.append('longitude', long);
        
        let response = await POST(endPoints.updateProfile, formData, {
            Authorization: await Retrieve("userToken")
        });
        if (response.ack == 1) {
            this.myFunction();
        } else {
            console.log("Error in api");
        }
    }
    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
    }

    myFunction = async () => {
        
        if (await Retrieve('userType')==='C') {
            let formData = new FormData();
            formData.append('user_id', await Retrieve("userId"));
            if(this.state.isScroll==true){
                formData.append('pageno', this.state.pageno+1);
            }else{
                formData.append('pageno', this.state.pageno);
            }

            if(this.state.isScroll == false){
                this.setState({ showLoader: true });
            }
            let response = await POST(endPoints.serviceProviderList, formData, {
                Authorization: await Retrieve("userToken")
            });
            this.setState({showLoader: false});
            // console.log(response.details.providers);
            // console.log(formData);
            //For normal load
            if (response && this.state.isScroll==false && response.details.ack == '1') {
                this.setState({serviceProviderList: response.details.providers});
            } 
            //For scroll
            if (response.details.providers && this.state.isScroll==true && response.details.ack == '1') {
                
                this.setState({
                    serviceProviderList: this.state.serviceProviderList.concat(response.details.providers),
                });
                this.setState({isScroll: false});
                this.setState({pageno: this.state.pageno+1});
            }
            
            if(response.details.ack == '0'){
                this.setState({isScroll: false});
            }
          
   
        } else {
            var today = new Date();
            var dd = today.getDate();

            var mm = today.getMonth()+1; 
            var yyyy = today.getFullYear();
            if(dd<10) 
            {
                dd='0'+dd;
            } 

            if(mm<10) 
            {
                mm='0'+mm;
            } 
            today = yyyy+'-'+mm+'-'+dd;
            let formData = new FormData();
            formData.append('service_provider_id', await Retrieve("userId"));
            formData.append('date', today);
            formData.append('time', moment(new Date()).format('HH:mm:ss'));
            if(this.state.isScroll==true){
                formData.append('pageno', this.state.pageno+1);
            }else{
                formData.append('pageno', this.state.pageno);
            }
            if(this.state.isScroll == false){
                this.setState({ showLoader: true });
            }
            
            let response = await POST(endPoints.joblist, formData, {
                Authorization: await Retrieve("userToken")
            });
            this.setState({showLoader: false});
            //For normal load
            if (response && this.state.isScroll==false && response.details.ack == '1') {
               this.setState({jobList: response.details.jobs});
            } 
            //For scroll
            if (response.details.jobs && this.state.isScroll==true && response.details.ack == '1') {
                this.setState({
                    jobList: this.state.jobList.concat(response.details.jobs),
                });
                
                this.setState({isScroll: false});
                this.setState({pageno: this.state.pageno+1});
            }
            
            if(response.details.ack == '0'){
                this.setState({isScroll: false});
            }


        } 
    };

    fetchList=()=>{
        this.setState({isScroll: true});
        this.myFunction();
    }

    myRate=(rating)=>{
        var output='';
        for (var i = 0; i < rating.length; i++) {
            output+= '<Icon name="md-star" color="#fbc201" size={15} />';
          }
        return output;
        //console.log(output)
    }



      
    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="homeDetails"
                    label="GoWasteOs"
                />

                <Loader 
                    loading={this.state.showLoader} 
                />
                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({
                            pageno:1,
                            isScroll:false,
                            jobList:{},
                            serviceProviderList:{}
                        },
                            ()=>{
                                this.myFunction()
                            })
                    }
                />
                
                
                {this.state.userType==="SP"?
                          
                <View style={style.flatlistcontainer}>
                    <Text style={[styles.label, style.mB2]}>Job List</Text>
                    <FlatList
                        data={Object.values(this.state.jobList)}
                        keyExtractor={item => item.id.toString()}
                        onEndReached={this.fetchList}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={ () => {return (
                            <Text>No job found</Text>
                        )}}
                        renderItem={({item}) => (
                            <TouchableOpacity 
                                    style={style.card} 
                                    onPress={() => this.props.navigation.navigate('JobDetails',{jobId: item.id})}
                                >
                                <View style={style.cardbody}>
                                    <View style={[style.rowSec, styles.width75]}>                                         
                                    <View style={style.cardthumb}>
                                        <Image source={{ uri: item.service.image }} style={{ width: 55, height: 55 }} />
                                    </View>
                                    <View style={styles.carddesc}>
                                        <Text style={styles.sheading}>{item.service.title}</Text>
                                        <View style={styles.rowbetween}>
                                            
                                            <View style={styles.prwrap}>
                                                <Text style={styles.mutetext}>{moment(item.date).format('MMMM Do YYYY')}</Text>
                                                <Text style={styles.mutetext}>{item.garbage_size+' '+item.service.unit}</Text>
                                            </View>                                                
                                        </View>          
                                    </View>
                                    </View>
                                    <TouchableOpacity 
                                        style={style.smbtn}
                                        onPress={() => this.props.navigation.navigate('BidPost',{jobId: item.id})}
                                    >
                                        <Text style={style.smbtntext}>Bid</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                :null}

                {this.state.userType==="C"?
                          
                <View style={style.flatlistcontainer}>
                    <Text style={[styles.label, style.mB2]}>Service Provider List</Text>
                    <FlatList
                        data={Object.values(this.state.serviceProviderList)}
                        keyExtractor={item => item.id.toString()}
                        onEndReached={this.fetchList}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={ () => {return (
                            <Text>No provider found</Text>
                        )}}
                        renderItem={({item}) => {
                            const myRate = item.rating==null?0: parseInt(item.rating);
                            const myBlankRate=5-myRate;
                            const items = [];
                            for (var i = 0; i < myRate; i++) {
                                items.push(<Icon name="md-star" color="#fbc201" size={15} key={"rate"+i}/>);
                            }
                            const blankItem = [];
                            for (var i = 0; i < myBlankRate; i++) {
                                blankItem.push(<Icon name="md-star-outline" color="#fbc201" size={15} key={"blank"+i}/>);
                            }
                            return (
                            
                            <TouchableOpacity 
                                style={style.card} 
                                onPress={() => this.props.navigation.navigate('UserProfileView',{userId: item.id})}
                            >
                                <View style={style.cardbody}>
                                    <View style={[style.rowSec, styles.width75]}>                                         
                                        <View style={style.cardthumb}>
                                            <Image source={{ uri: item.profilePicture && item.profilePicture.includes("https://")?item.profilePicture:dynamicImageURL +'/'+ item.profilePicture }} style={{ width: 65, height: 65 }} />
                                        </View>
                                        <View style={styles.carddesc}>
                                            <Text style={styles.sheading}>{item.firstName+' '+item.lastName}</Text>
                                            <View style={styles.rowbetween}>
                                                <View style={styles.rwrap}>
                                                    <Text style={styles.mutetext}>Rating</Text>
                                                    <View style={style.rowSec}>
                                                        {items}
                                                        {blankItem}
                                                    </View>
                                                </View>
                                            </View>          
                                        </View>
                                    </View>
                                    <TouchableOpacity 
                                        style={style.smbtn}
                                        onPress={() => this.props.navigation.navigate('ManualBooking',{providerId: item.id})}
                                    >
                                        <Text style={style.smbtntext}>Book</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                    }
                    />
                </View>
                :null}
            </SafeAreaView>
            
        )
    }
}
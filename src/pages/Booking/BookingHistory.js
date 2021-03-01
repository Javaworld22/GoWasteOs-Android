import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, FlatList } from 'react-native'
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationEvents } from 'react-navigation';
export default class BookingHistory extends Component {
    constructor(props){
        super(props);  
        this.state = {
            bookingList: [],
            showLoader: false,
            showDetails:false,
            usertype:'',
            pageno: 1,
            isScroll:false,
          };   
    }
    componentDidMount = async () => {
        this.setState({usertype: await Retrieve('userType')});
        this.getBookingList();

    };

    getBookingList=async()=>{
        let formData = new FormData();
        if(this.state.usertype == 'C'){
            formData.append('customer_id', await Retrieve("userId"));
        } else {
            formData.append('service_provider_id', await Retrieve("userId"));
        }
        if(this.state.isScroll==true){
            formData.append('pageno', this.state.pageno+1);
        }else{
            formData.append('pageno', this.state.pageno);
        }
 
        if(this.state.isScroll == false){
            this.setState({ showLoader: true });
        }
        let response = await POST(endPoints.bookinglist, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        //For normal load
        if (this.state.isScroll==false && response.details.ack == '1') {
            this.setState({bookingList: response.details.bookings},
                ()=>{this.setState({showDetails:true});}
            );
        }
        //for delete
        if(this.state.isScroll==false && response.details.ack == '0' && this.state.pageno==1){
            this.setState({bookingList: {}});
        } 
        //For scroll
        if (response.details.bookings && this.state.isScroll==true && response.details.ack == '1') {
            // const object1 = this.state.bookingList;             
            // const object2 = response.details.bookings;             
            // const object3 = [...object1, ...object2];   
            // this.setState({bookingList: object3},
            //     ()=>{this.setState({showDetails:true});}
            // );

            this.setState({
                bookingList: this.state.bookingList.concat(response.details.bookings),
            });
            this.setState({isScroll: false});
            this.setState({pageno: this.state.pageno+1});
        } 
        this.setState({isScroll: false});
    }

    fetchList=()=>{
        this.setState({isScroll: true});
        this.getBookingList();
    }

    render() {
        const bookingList = this.state.bookingList;
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Booking List"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({pageno:1, isScroll:false},
                            ()=>{
                                this.getBookingList()
                            })
                    }
                    
                />
                                 
                    <View style={[style.flatlistcontainer, style.mT2]}>
   
                        <FlatList
                            data={Object.values(bookingList)}
                            keyExtractor={item => item.id.toString()}
                            onEndReached={this.fetchList}
                            onEndReachedThreshold={0.5}
                            ListEmptyComponent={ () => {return (
                                <Text>No booking available</Text>
                            )}}
                            renderItem={({item}) => (
                                <TouchableOpacity 
                                    style={style.card}
                                    onPress={() => this.props.navigation.navigate('BookingDetails',{bookingId: item.id})}
                                >
                                <View style={style.cardbody}>
                                    <View style={[style.rowSec, styles.width70]}> 
                                        <View style={styles.carddesc}>
                                            <View style={style.rowSec}> 
                                                <Text style={styles.sheading}> {item.view_id}</Text> 
                                            </View>
                                            <View style={[style.rowSec, style.alignCenter]}>
                                                <Icon name="ios-calendar-outline" color="#fb6400" size={14} />
                                                <Text style={[styles.sdate2, style.mb0]}> {moment(item.booking_date).format('MMMM Do YYYY')}</Text> 
                                            </View>                                        
                                            <View style={[style.rowSec, style.alignCenter]}>
                                                <Icon name="ios-time-outline" color="#fb6400" size={14} />
                                                <Text style={[styles.sdate2, style.mb0]}> {moment(item.booking_time, "HH:mm:ss").format("hh:mm A")}</Text> 
                                            </View>                                            
                                        </View>
                                    </View>
                                    
                                    {item.service_status == 'P' && moment(item.booking_date).format('YYYY-MM-DD')>=moment(new Date()).format('YYYY-MM-DD') ?
                                    <View style={[style.smbtn, style.yellowbg]}>
                                        <Text style={[style.smbtntext, {color:'#000'}]}>Pending</Text>
                                    </View>
                                    :null
                                    }
                                    {item.service_status == 'P' && moment(item.booking_date).format('YYYY-MM-DD')<moment(new Date()).format('YYYY-MM-DD') ?
                                    <View style={[style.smbtn, style.redbg]}>
                                        <Text style={[style.smbtntext, {color:'white'}]}>Expired</Text>
                                    </View>
                                    :null
                                    }
                                    {item.service_status == 'C&R' &&
                                    <View style={[style.smbtn, style.cyanbg]}>
                                        <Text style={style.smbtntext}>Cancelled</Text>
                                    </View>
                                    }
                                    {item.service_status == 'C' &&
                                    <View style={[style.smbtn, style.Greenbg]}>
                                        <Text style={style.smbtntext}>Completed</Text>
                                    </View>
                                    }
                                    
                                </View>
                            </TouchableOpacity>

                        )}
                    />
                    
                </View>
                    
            </SafeAreaView>
            
        )
    }
}

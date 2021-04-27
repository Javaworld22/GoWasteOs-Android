import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView,FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import { NavigationEvents } from 'react-navigation';

export default class Notification extends Component {
    constructor(props){
        super(props);  
        this.state = {
            notificationList: {},
            showLoader: false,
            pageno: 1,
            isScroll:false,
          };   
    }
    componentDidMount = async () => {
        this.getNotification();
    };

    go=(type, id)=>{
        // console.log(type);
        if(type==="BID"){
            this.props.navigation.navigate('BidHistory',{jobId:id});
        } else if(type==="BOOK" || type==="SERVICE COMPLETE" || type==="PAYMENT"){
            this.props.navigation.navigate('BookingDetails',{bookingId: id});
        } else if(type==="SERVICE STARTED"){
            this.props.navigation.navigate('BookingDetails',{bookingId: id});
        } else if(type==="CONFIRMATION"){
            this.props.navigation.navigate('BookingConfirmation',{confirmationId:id});
        } else if(type==="JOB"){
            this.props.navigation.navigate('JobDetails',{jobId:id});
        }
    }

    getNotification=async()=>{
        this.changeNotiReadStatus();
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
        let response = await POST(endPoints.notificationList, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});

        //for normal load
        if (response && response.details.ack == '1' && this.state.isScroll==false) {
            this.setState({notificationList: response.details.notifications});
        } 

        //for scroll
        if(response.details.notifications && this.state.isScroll==true && response.details.ack == '1'){
            this.setState({
                notificationList: this.state.notificationList.concat(response.details.notifications),
            });        
            this.setState({isScroll: false});
            this.setState({pageno: this.state.pageno+1});
        }
        
        if(response.details.ack == '0'){
            this.setState({isScroll: false});
        }
    }

    changeNotiReadStatus= async() => {
        let formData = new FormData();
        formData.append('to_id', await Retrieve("userId"));
        // console.log(formData);
        let response = await POST(endPoints.updateNotiReadStatus, formData, {
            Authorization: await Retrieve("userToken")
        });
        // console.log(response);
    }

    fetchList=()=>{
        this.setState({
            isScroll: true,
        });
        this.getNotification();
    }
    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="homeDetails"
                    label="Notification"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({
                            pageno:1,
                            isScroll:false,
                            notificationList: {},
                        },
                            ()=>{
                                this.getNotification();
                            })
                    }
                />
                
                <View style={style.flatlistcontainer}>
                    <FlatList
                        data={Object.values(this.state.notificationList)}
                        keyExtractor={item => item.id.toString()}
                        onEndReached={this.fetchList}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={ () => {return (
                            <Text>No notification available</Text>
                        )}}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.notificationbox} onPress={() => this.go(item.type, item.details_id)} >
                                    
                                <View style={[style.avtbox],{paddingRight:6}}>
                                    <View style={style.avatar}>
                                        <Image source={{ uri: item.from_user.profilePicture }} style={{ width: 65, height: 65 }} />
                                    </View>
                                </View>
                                <View style={{flexDirection:'row'}}>
                                    <View style={style.centercontent}>
                                        <Text style={style.headingmain} numberOfLines={1} >{item.message}</Text>
                                        <View style={[style.rowSec, style.alignCenter]}>
                                            <Icon name="ios-time-outline" color="#777" size={14} />
                                            {/* <Text style={style.msgtext}>{moment(item.created_date).format('MMMM Do YYYY')}, {moment.utc(item.created_date.split(' ')[1], 'HH:mm:ss').format('hh:mm A')}</Text> */}
                                            <Text style={style.msgtext}>{moment(item.created_date).format('MMMM Do YYYY')}, {moment.utc(item.created_date).format('hh:mm A')}</Text>
                                        </View>                                
                                    </View>
                                    <View style={{paddingLeft:10}}>
                                        <Icon name="chevron-forward" color="#1cae81" size={24} />
                                    </View>
                                </View>
                                
                            </TouchableOpacity>
                        )}
                    />
                </View>
                
            </SafeAreaView>
        )
    }
}

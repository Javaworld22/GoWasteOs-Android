import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image,Alert, ScrollView, FlatList } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import { NavigationEvents } from 'react-navigation';

export default class BidHistory extends Component {
    constructor(props){
            super(props);  
            this.state = {
                bidList: [],
                jobId: this.props.navigation.state.params.jobId,
                showLoader: false,
                showDetails: false,
                usertype:'',
                loginid:'',
                isApiError: false,
                pageno: 1,
                isScroll:false,
              };   
    }
    componentDidMount = async () => {      
        this.setState({usertype: await Retrieve('userType')});
        this.setState({loginid: await Retrieve('userId')});
        this._getBidList();
    };

    _getBidList = async () => {
        let formData = new FormData();
        formData.append('job_id', this.state.jobId);
        if(this.state.isScroll==true){
            formData.append('pageno', this.state.pageno+1);
        }else{
            formData.append('pageno', this.state.pageno);
        }  
        if(this.state.isScroll == false){
            this.setState({ showLoader: true });
        }
        let response = await POST(endPoints.bidHistory, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        //console.log(response.details.bids);
        //for normal load
        if (response.details.ack == '1' && this.state.isScroll==false) {
            this.setState({bidList: response.details.bids},
                () => {
                    this.setState({showDetails:true});
                }
            );
        }

        //for scroll
        if(this.state.bidList && this.state.isScroll==true && response.details.ack == '1'){
            const object1 = this.state.bidList;             
            const object2 = response.details.bids;             
            const object3 = [...object1, ...object2]; 
            this.setState({bidList: object3},
                () => {
                    this.setState({showDetails:true});
                    this.setState({isScroll: false});
                    this.setState({pageno: this.state.pageno+1});
                }
            );        

        } 
        this.setState({isScroll: false});
    }

    _sendConfirmation = async (bid_id) => {
    
        let formData = new FormData();
        formData.append('customer_id', await Retrieve("userId"));
        formData.append("bid_id",bid_id);
        formData.append("noti_date_time",moment().format('YYYY-MM-DD HH:mm:ss'));
        this.setState({ showLoader: true });
        let response = await POST(endPoints.sendConfirmation, formData, {
          Authorization: await Retrieve("userToken")
        });
        this.setState({ showLoader: false });
       
        if (response.details.ack == 1) {
            Alert.alert("", response.details.message, [
                { text: "Ok", onPress: () => this._getBidList()}
            ]);
        } else {
            Alert.alert("", response.details.message, [
                { text: "Ok", onPress: () => this._getBidList()}
            ]);
        }
    };

    fetchList=()=>{
        this.setState({isScroll: true},
            () => {
                this._getBidList();
            }
        );         
    }
    
      
    render() {
        const bidList = this.state.bidList;
        console.log(bidList);

        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Bid History"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({
                            pageno:1, 
                            isScroll:false,
                            bidList: [],
                        },
                            ()=>{
                                this._getBidList()
                            })
                    }
                    
                />
               
                <View style={style.flatlistcontainer}>

                    <FlatList
                        data={Object.values(bidList)}
                        keyExtractor={item => item.id.toString()}
                        onEndReached={this.fetchList}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={ () => {return (
                            <Text>No bid history available</Text>
                        )}}
                        renderItem={({item}) => (

                        <View style={[style.card, style.noborder]}>
                            <View style={style.cardbody}>
                                <View style={[style.rowSec, styles.width75]}> 
                                    <View style={style.cardthumb}>
                                        {this.state.usertype=='C'
                                        ?<Image source={{ uri:item.Service_Provider.profilePicture }} style={{ width: 65, height: 65 }} />
                                        :
                                        this.state.loginid === item.Service_Provider.id
                                        ?<Image source={{ uri:item.Service_Provider.profilePicture }} style={{ width: 65, height: 65 }} />
                                        :<Image source={require('../../assets/images/no-user.jpg')} style={{ width: 65, height: 65 }} />
                                        }
                                    </View>
                                    <View style={styles.carddesc}>
                                        {this.state.usertype=='C'?
                                        <TouchableOpacity  onPress={() => this.props.navigation.navigate('UserProfileView',{userId: item.Service_Provider.id})}>
                                            <View style={style.rowSec}>
                                                <Text style={[styles.sheading, {color:'#484848'}]}>
                                                    {item.Service_Provider.firstName+' '+item.Service_Provider.lastName}
                                                </Text>                 
                                            </View>  
                                        </TouchableOpacity>
                                        :
                                        <View style={style.rowSec}>
                                            <Text style={[styles.sheading, {color:'#484848'}]}>
                                                {this.state.loginid === item.Service_Provider.id
                                                ?item.Service_Provider.firstName+' '+item.Service_Provider.lastName
                                                :'Service Provider'}
                                            </Text>                 
                                        </View>
                                        }
                                        <View style={[style.rowSec, style.alignCenter]}>
                                            <Icon name="ios-calendar-outline" color="#fb6400" size={14} />
                                            <Text style={[styles.sdate2, style.mb0]}>{moment(item.created_date).format('MMMM Do YYYY')}</Text> 
                                        </View>                                        
                                        <View style={[style.rowSec, style.alignCenter]}>
                                            <Icon name="ios-time-outline" color="#fb6400" size={14} />
                                            <Text style={[styles.sdate2, style.mb0]}>{moment(item.created_date.split(' ')[1], 'HH:mm:ss').format('hh:mm A')}</Text> 
                                        </View>
                                        <View style={[style.rowSec, style.alignCenter]}>
                                            <Icon name="ios-pricetags-outline" color="#fb6400" size={14} />
                                            <Text style={[styles.sdate2, style.mb0]}> ₦{item.price}</Text> 
                                        </View>                                         
                                                                                
                                    </View>
                                </View>
                                { this.state.usertype == 'C' && 
                                    <View>
                                        { item.is_confirmation_send === "0"?
                                        <TouchableOpacity 
                                            style={style.smbtn}
                                            onPress = {()=>this._sendConfirmation(item.id)}
                                        >
                                            <Text style={style.smbtntext}>Confirm</Text>
                                        </TouchableOpacity>
                                        :
                                        <View style={style.inactivebtn}>
                                            <Text style={style.smbtntext}>Sent</Text>
                                        </View>
                                        }
                                    </View>
                                }
                            </View>
                        </View>
                        )}
                    />
                                
                </View>
            </SafeAreaView>
            
        )
    }
}
import React, { Component } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import { NavigationEvents } from 'react-navigation';

export default class BookingConfirmList extends Component {

    constructor(props){
        super(props);  
        this.state = {
            confirmList: [],
            showLoader: false,
            showDetails:false,
            usertype:'',
            pageno: 1,
            isScroll:false
          };   
    }
    componentDidMount = async () => {       
        this.setState({usertype: await Retrieve('userType')});
        this.getConfirmatinList();
    };

    getConfirmatinList=async()=>{

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
        let response = await POST(endPoints.confirmationList, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        //for normal load
        if (response.details.ack == '1' && this.state.isScroll==false) {
            this.setState({confirmList: response.details.confirmations},
                ()=>{this.setState({showDetails:true});}
            );
        }

        //for scroll
        if(response.details.confirmations && this.state.isScroll==true && response.details.ack == '1'){
            // const object1 = this.state.confirmList;             
            // const object2 = response.details.confirmations;             
            // const object3 = [...object1, ...object2];
            this.setState({confirmList: this.state.confirmList.concat(response.details.confirmations)},
                () => {
                    this.setState({showDetails:true});
                    this.setState({isScroll: false});
                    this.setState({pageno: this.state.pageno+1});
                }
            ); 
            // this.setState({confirmList: object3},
            //     () => {
            //         this.setState({showDetails:true});
            //         this.setState({isScroll: false});
            //         this.setState({pageno: this.state.pageno+1});
            //     }
            // );        

        } 
        this.setState({isScroll: false});
    }

    fetchList=()=>{
        this.setState({isScroll: true},
            () => {
                this.getConfirmatinList();
            }
        );         
    }


    render() {
        const confirmList = this.state.confirmList;

        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Confirmation List"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({pageno:1, isScroll:false},
                            ()=>{
                                this.getConfirmatinList()
                            })
                    }
                
                />
                               
                <View style={style.flatlistcontainer}>  

                    <FlatList
                        data={Object.values(confirmList)}
                        keyExtractor={item => item.id.toString()}
                        onEndReached={this.fetchList}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={ () => {return (
                            <Text>No confirmation available</Text>
                        )}}
                        renderItem={({item}) => (
                            <TouchableOpacity 
                                onPress={() => this.props.navigation.navigate('BookingConfirmation',{confirmationId:item.id})}
                                style={[style.card, style.noborder]}
                            >
                                <View style={style.cardbody}>
                                    <View style={[style.rowSec, styles.width75]}> 
                                        <View style={style.cardthumb}>
                                            <Image source={{ uri: item.services.image }} style={{ width: 55, height: 55 }} />
                                            
                                        </View>
                                        <View style={styles.carddesc}>
                                            <View style={style.rowSec}>
                                            
                                            <Text style={styles.sheading}> {item.services.title}</Text> 
                                            </View>  
                                            <View style={[style.rowSec, style.alignCenter]}>
                                                <Icon name="ios-list-circle" color="#fb6400" size={14} />
                                                <Text style={[styles.sdate2, style.mb0]}>{item.job.garbage_size+' '+item.services.unit}</Text> 
                                            </View>                                        
                                            <View style={[style.rowSec, style.alignCenter]}>
                                                <Icon name="ios-calendar-outline" color="#fb6400" size={14} />
                                                <Text style={[styles.sdate2, style.mb0]}> {moment(item.job.date).format('MMMM Do YYYY')}</Text> 
                                            </View>                                        
                                                                                    
                                        </View>
                                    </View>
                                    {item.bid.is_accepted !== 0 &&
                                    <View style={{alignSelf:'center'}}>
                                        {item.bid.is_accepted === 1?
                                        <Icon name="checkmark-circle" color="#1cae81" size={24} /> 
                                        :
                                        <Icon name="backspace" color="red" size={24} />
                                        }   
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

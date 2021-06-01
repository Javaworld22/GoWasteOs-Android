import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView,FlatList } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle'
import styles from './style'
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import { NavigationEvents } from 'react-navigation';
import moment from "moment";

export default class ChatList extends Component {
    constructor(props){
        super(props);  
        this.state = {
            messageGroupList: {},
            showLoader: false,
            pageno: 1,
            isScroll:false,
          };   
    }

    componentDidMount = async() => {     
        this.fetchUserList();                    
    };

    fetchUserList=async()=>{
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
        let response = await POST(endPoints.messagesGroups, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});

        // console.log(response.details.chatGroups);

        //For normal load
        if (response && this.state.isScroll==false && response.details.ack == '1') {
            this.setState({messageGroupList: response.details.chatGroups});
        } 
        //For scroll
        if (response.details.chatGroups && this.state.isScroll==true && response.details.ack == '1') {
            this.setState({
                messageGroupList: this.state.messageGroupList.concat(response.details.chatGroups),
            }); 
            
            this.setState({isScroll: false});
            this.setState({pageno: this.state.pageno+1});
        }
        
        if(response.details.ack == '0'){
            this.setState({isScroll: false});
        }
    }

    fetchScrollList=()=>{
        this.setState({isScroll: true});
        this.fetchUserList();
    }
    

    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="homeDetails"
                    label="Messages"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({
                            pageno:1,
                            isScroll:false,
                        },
                            ()=>{
                                this.fetchUserList()
                            })
                    }
                />
                
                <View style={style.flatlistcontainer}>
                    <FlatList
                        data={Object.values(this.state.messageGroupList)}
                        keyExtractor={item => item.id.toString()}
                        onEndReached={this.fetchScrollList}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={ () => {return (
                            <Text>No message found</Text>
                        )}}
                        renderItem={({item}) => {
                            var date=item.messagecreateddate.split(" ")[0];
                            var time=item.messagecreateddate.split(" ")[1];
                            var today = new Date();
                            var dd = String(today.getDate()).padStart(2, '0');
                            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                            var yyyy = today.getFullYear();
                            today = yyyy+'-'+mm + '-' + dd ;
                            var dateTime="";
                            if(today==date){
                                dateTime=moment.utc(time, "HH:mm:ss").format('hh:mm A');
                            }else{
                                dateTime=dd+'/'+mm + '/' + yyyy;
                            }
                            return (
                            
                            <TouchableOpacity 
                                style={styles.chatbox} 
                                onPress={() => this.props.navigation.navigate('Message',{to_id: item.other_user_id})}
                            >
                                <View style={style.avtbox}>
                                    <View style={style.avatar}>
                                        <Image 
                                            source={{ uri: item.other_user_profilePicture }}  
                                            style={styles.senderavtimg} 
                                        />
                                    </View>
                                </View>
                                <View style={{flexDirection:'row',justifyContent:'space-between',width:'85%'}}>
                                    <View style={styles.centercontent}>
                                        <Text style={style.headingmain} numberOfLines={1} >{item.other_user_name}</Text>                               
                                        <Text style={style.msgtext} numberOfLines={1}>{item.message}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.datetext}> {dateTime}</Text>
                                        {item.unread_msg_count>0 && 
                                        <View style={{padding:5}}>
                                            <Text style={styles.unreadmsgcount}> 
                                                {item.unread_msg_count}
                                            </Text>
                                        </View>
                                        }
                                    </View>
                                </View>
                                {/* <View style={styles.centercontent}>
                                    <Text style={style.headingmain} numberOfLines={1} >{item.other_user_name}</Text>                               
                                    <Text style={style.msgtext} numberOfLines={1}>{item.message}</Text>
                                </View>
                                <View style={style.colicon}>
                                    <Text style={styles.datetext}> {dateTime}</Text>
                                    {item.unread_msg_count>0 && 
                                    <View style={{padding:5}}>
                                        <Text style={styles.unreadmsgcount}> 
                                            {item.unread_msg_count}
                                        </Text>
                                    </View>
                                    }
                                </View> */}
                            </TouchableOpacity>
                        )}
                    }
                    />
                </View>
            </SafeAreaView>
        )
    }
}

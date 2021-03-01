import React, { Component } from 'react'
import { Text,TextInput, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import style from '../../components/mainstyle'
import styles from './style'
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import { NavigationEvents } from 'react-navigation';
import moment from "moment";

export default class Message extends Component {
    constructor(props){
        super(props);  
        this.scrollViewRef = React.createRef();
        this.state = {
            to_id: this.props.navigation.state.params.to_id,
            messageList: {},
            showLoader: false,
            pageno: 1,
            isScroll:false,
            userType:"",
            message:"",
          };   
    }

    componentDidMount = async() => {
        this.setState({userType: await Retrieve('userType')});        
        this.myFunction();                    
    };

    myFunction=async()=>{
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        if(this.state.isScroll==true){
            formData.append('pageno', this.state.pageno+1);
        }else{
            formData.append('pageno', this.state.pageno);
        } 
        formData.append('to_id', this.state.to_id);
        this.setState({ showLoader: true });
        let response = await POST(endPoints.messages, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});

        //For normal load
        if (response && this.state.isScroll==false && response.details.ack == '1') {
            this.setState({messageList: response.details.messages.reverse()});
        } 
        // //For scroll
        if (response && this.state.isScroll==true && response.details.ack == '1') {
            const object1 = this.state.messageList;             
            const object2 = response.details.messages.reverse();             
            const object3 = [...object2, ...object1];         
            this.setState({messageList: object3});
            this.setState({isScroll: false});
            this.setState({pageno: this.state.pageno+1});
        } 
    }
    sendMessage=async()=>{
        if(this.state.message!=""){
            let formData = new FormData();
            formData.append('message', this.state.message);
            formData.append('to_id', this.state.to_id);
            formData.append('from_id', await Retrieve("userId"));
            this.setState({ showLoader: true });
            let response = await POST(endPoints.sendMessages, formData, {
                Authorization: await Retrieve("userToken")
            });
            this.setState({showLoader: false});
            //console.log(response)
            if (response && this.state.isScroll==false && response.details.ack == '1') {
                this.setState({message: ""});
                this.myFunction();
            } 
        }

    }
    fetchList=()=>{
        this.setState({isScroll: true});
        this.myFunction();
    }

    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Messages"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <View style={{flex: 1}}>
                    <ScrollView                    
                      ref={this.scrollViewRef}
                      onContentSizeChange={() => this.scrollViewRef.current.scrollToEnd({ animated: true })}
                      onScrollBeginDrag={this.fetchList}>     
                        <View  style={[style.container],{paddingBottom:70,paddingLeft:10,paddingRight:10}}>
                        <NavigationEvents
                        onDidFocus={() => 
                            this.myFunction()
                        }
                        />
                        
                        {this.state.messageList && this.state.messageList.length > 0 ? this.state.messageList.map((item, index) => {
                        var date=item.created_date.split(" ")[0];
                        var time=item.created_date.split(" ")[1];
                        var today = new Date();
                        var dd = String(today.getDate()).padStart(2, '0');
                        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                        var yyyy = today.getFullYear();
                        today = yyyy+'-'+mm + '-' + dd ;
                        var dateTime="";
                        if(today==date){
                            dateTime=moment.utc(time, "HH:mm:ss").format('hh:mm A');
                        }else{
                            dateTime=dd+'/'+mm + '/' + yyyy+', '+moment(time, "HH:mm:ss").format('hh:mm A');
                        }
                        return (
                            
                            <View key={index}>
                                {item.from_user.id==this.state.to_id?
                                <View style={styles.receivebox}>
                                <View style={style.avtbox}>
                                    <View style={style.avatar}>
                                        <Image source={{ uri:item.from_user.profilePicture}} style={style.avtimage} />
                                    </View>
                                </View>
                                <View style={styles.receivecontent}>
                                    <View style={{backgroundColor:'#4ba9df',borderRadius:15,}}>
                                        <Text style={{color:'white',padding:7}}> {item.message} </Text>
                                    </View>
                                    <Text style={styles.datetext}> {dateTime}</Text>
                                </View>
                            </View>:
                            <View style={styles.sendbox}>                                
                                <View style={styles.sendcontent}>
                                    <View style={{backgroundColor:'#00a4ff',borderRadius:15,}}>
                                        <Text style={{color:'white',padding:7}}> {item.message} </Text>
                                    </View>
                                    <Text style={styles.datetext}> {dateTime}</Text>
                                </View>
                                <View style={style.avtbox}>
                                    <View style={style.avatar}>
                                        <Image source={{ uri:item.from_user.profilePicture}} style={style.avtimage} />
                                    </View>
                               </View>                                
                            </View>
                            }
                            </View>
                            );
                        }):null}

                        </View>   
                    </ScrollView>

                    <View style={styles.bottomSendBox}>
                        <View style={styles.chatinputBox}>
                            <TextInput 
                                placeholder="Enter some text ...." 
                                placeholderTextColor="#acacac" 
                                style={style.formControlInput}
                                onChangeText={text =>this.setState({ message: text })}
                                value={this.state.message}
                            />
                        </View>
                        <TouchableOpacity style={{paddingLeft:10,paddingTop:15}} onPress={() => this.sendMessage()} >
                            <Icon name="send" size={25} color="#fb6400"/>
                        </TouchableOpacity>  
                    </View>

                </View>
            </SafeAreaView>
        )
    }
}

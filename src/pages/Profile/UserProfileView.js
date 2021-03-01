import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, TextInput, KeyboardAvoidingView,ImageBackground, Alert } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import moment from "moment";
import { NavigationEvents } from 'react-navigation';
import Modal from 'react-native-modal';
import StarRating from 'react-native-star-rating';
export default class UserProfileView extends Component {

    constructor(props){
        super(props);  
        this.state = {
            userDetails: [],
            reviewList: [],
            userId: this.props.navigation.state.params.userId,
            showLoader: false,
            showDetails: false,
            pageno: 1,
            isScroll:false,
            myId:"",

            modalVisible:false,
            starCount:5,
            comment:"",
            to_id:this.props.navigation.state.params.userId,
            isDetailsError:false,
            modalError:"",
            comment:""
          };   
    }

    onStarRatingPress=(rating)=> {
        this.setState({
            starCount: rating
          });
      }

    rate=async()=>{
        if(this.state.comment!=""){
            this.setState({modalError: ""});            
            this.setState({isDetailsError: false});            
            let formData = new FormData();
            formData.append('from_id', await Retrieve("userId"));
            formData.append('to_id', this.state.to_id);
            formData.append('is_reviewer_customer', await Retrieve("userType")=="C"?1:0);
            formData.append('comment', this.state.comment);
            formData.append('rating', this.state.starCount);
            formData.append('booking_id', "");
            this.setState({showLoader: true});
            let response = await POST(endPoints.addReview, formData, {
              Authorization: await Retrieve("userToken")
            });
            this.setState({ showLoader: false });
            
            if (response.details.ack == 1) {
                this.setState({
                    modalVisible: false,
                    isDetailsError: false,
                    modalError: ""
                },() => {
                    Alert.alert("", "Thank you for your review.", [
                        { text: "Ok", onPress:()=>{this.getProfileDetails();}}
                    ]);                    
                    }
                ); 
               
                
            } else {
                this.setState({isDetailsError: true});
                this.setState({modalError: response.details.message});
            }
        }else{
            this.setState({isDetailsError: true});
            this.setState({modalError: "Please leave your comment before submit"});
        }
    }

    toggleModal = () => {
      this.setState({modalVisible: !this.state.modalVisible});
    };

    componentDidMount = () => {
        this.getProfileDetails();
    };

    getProfileDetails=async()=>{
        this.setState({myId: await Retrieve("userId")});
        let formData = new FormData();
        formData.append('user_id', this.state.userId);
        if(this.state.isScroll==true){
            formData.append('pageno', this.state.pageno+1);
        }else{
            formData.append('pageno', this.state.pageno);
        } 
        this.setState({showLoader: true});
        let response = await POST(endPoints.profileDetails, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        //for normal load
        if (response.ack == '1' && this.state.isScroll==false) {
            this.setState({
                userDetails: response.details,
                reviewList: response.reviewlist
            },() => {
                    this.setState({showDetails:true});
                }
            );   
        }

        //for scroll
        if(this.state.isScroll==true && response.ack == '1' && response.reviewlist.length>0){
            const object1 = this.state.reviewList;             
            const object2 = response.reviewlist;             
            const object3 = [...object1, ...object2]; 
            this.setState({reviewList: object3},
                () => {
                    this.setState({showDetails:true});
                    this.setState({isScroll: false});
                    this.setState({pageno: this.state.pageno+1});
                }
            );        

        } 
    }

    fetchList=()=>{
        this.setState({isScroll: true},
            () => {
                this.getProfileDetails();
            }
        );         
    }




    render() {
       // console.log(this.state.myId, this.state.to_id)
        const userDetails = this.state.userDetails;
        const reviewList = this.state.reviewList;
        const userrating = parseInt(this.state.userDetails.rating);

        const myRate=userrating==null?0:userrating;
        const myBlankRate=5 - myRate;
        const myItems = [];
        for (var i = 0; i < myRate; i++) {
            myItems.push(<Icon name="md-star" color="#fbc201" size={15} key={"rate"+i}/>);
        }
        const myBlankItem = [];
        for (var i = 0; i < myBlankRate; i++) {
            myBlankItem.push(<Icon name="md-star-outline" color="#fbc201" size={15} key={"blank"+i}/>);
        }
        
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Profile Details"
                    myId={this.state.myId}
                    to_id={this.state.to_id}
                />

                <Loader 
                    loading={this.state.showLoader} 
                />
                <Modal isVisible={this.state.modalVisible}>
                    <View style={style.modalcenter}>
                        <TouchableOpacity style={style.closemodal} onPress={this.toggleModal}>
                            <Icon name="close-circle" color="#fb6400" size={30}  />
                        </TouchableOpacity>
                        <Text style={style.mheading}>Rate Us</Text>
                        <View style={[style.rowCenter, style.alignCenter ]}>
                        <StarRating
                                disabled={false}
                                maxStars={5}
                                rating={this.state.starCount}
                                fullStarColor={'#fbc201'}
                                selectedStar={(rating) => this.onStarRatingPress(rating)}
                            />
                        </View>
                        <View style={style.roundinput}>
                            <TextInput  
                                placeholder="Help us to grow with your review" 
                                placeholderTextColor="#acacac" 
                                style={style.forminput}
                                //autoCapitalize = 'none'
                                onChangeText={text =>this.setState({ comment: text })}
                                multiline={true}
                            />
                            
                        </View>
                        
                        {this.state.isDetailsError && (
                            <Text style={style.errorMsgModal}>
                                {this.state.modalError}
                            </Text>
                        )} 
                            
                        <TouchableOpacity style={style.whitebtn} onPress={this.rate}>
                            <Text style={style.wbttext}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                
                <ScrollView onScrollEndDrag={this.fetchList} >
                {this.state.showDetails &&
                    <View style={style.container}>
                        <NavigationEvents
                            onDidFocus={() => 
                                this.setState({pageno:1},
                                    ()=>{
                                        this.getProfileDetails()
                                    })
                            }
                            
                        />
                        <View style={styles.profiletop}>
                            <ImageBackground source={require('../../assets/images/profilebg.png')} style={styles.profileround} >
                                <Image 
                                    source={{uri:userDetails.profilePicture && userDetails.profilePicture.includes("https://")?userDetails.profilePicture:dynamicImageURL + "/" + userDetails.profilePicture}} 
                                    style={styles.profileimg} 
                                />
                            </ImageBackground>
                            <View style={styles.procontent}>
                                <Text style={styles.namepro}>{userDetails.firstName+' '+userDetails.lastName}</Text>
                                <Text style={[styles.mailpro],{paddingBottom:5}}>{userDetails.email}</Text>
                                <View style={style.rowSec}>
                                    {myItems}
                                    {myBlankItem}

                                {/* <TouchableOpacity style={{backgroundColor:'#eaeaea', paddingLeft:5}} onPress={() => this.props.navigation.navigate('Rating',{to_id: this.state.userId})}> */}
                                {this.state.myId!=this.state.to_id?
                                <TouchableOpacity style={{backgroundColor:'#eaeaea', paddingLeft:5}} onPress={() => this.setState({modalVisible: true})}>
                                    <Text style={styles.rttext}>Rate Us</Text>
                                </TouchableOpacity>:null
                                }
                                   
                                </View>
                            </View>
                        </View>

                        <View style={[style.card, style.noborder]}>
                            <View style={style.cardbody}>
                                <View style={{padding:10}}>
                                    <View style={[style.rowSec, style.mB2]}>
                                        <TouchableOpacity style={style.mR1}>
                                            <Icon name="ios-location" color="#fb6400" size={20} />
                                        </TouchableOpacity>
                                        <View style={[styles.info, style.mL1]}>
                                            <Text style={styles.label}>Location</Text>
                                            <Text style={styles.smlabel}>{userDetails.address}</Text>
                                        </View>
                                    </View>
                                    <View style={style.rowSec}>
                                        <TouchableOpacity style={style.mR1}>
                                            <Icon name="md-call" color="#fb6400" size={20} />
                                        </TouchableOpacity>
                                        <View style={[styles.info, style.mL1]}>
                                            <Text style={styles.label}>Phone</Text>
                                            <Text style={styles.smlabel}>{userDetails.phoneNumber}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View>
                            <Text style={styles.labelgray}>Reviews List</Text>
                        </View>
                        
                        {reviewList && reviewList.length > 0 ?
                        <View >
                            {reviewList && reviewList.length > 0 && reviewList.map((item, index) => {
                                const rvrating = parseInt(item.rating);
                                const rvRate=item.rating==null?0:item.rating;
                                const rvBlankRate=5 - rvRate;
                                const rvItems = [];
                                for (var i = 0; i < rvRate; i++) {
                                    rvItems.push(<Icon name="md-star" color="#fbc201" size={15} key={"rvrate"+i}/>);
                                }
                                const rvBlankItem = [];
                                for (var i = 0; i < rvBlankRate; i++) {
                                    rvBlankItem.push(<Icon name="md-star-outline" color="#fbc201" size={15} key={"rvblank"+i}/>);
                                }

                            return (
                            <View 
                                style={style.card} 
                                key={index}
                            >
                                <View style={style.cardbody}>
                                    <View style={[style.rowSec, styles.width75]}>                                         
                                        <View style={style.cardthumb}>
                                            <Image 
                                                source={{uri: item.image}} 
                                                style={{ width: 65, height: 65 }}
                                            />
                                        </View>
                                        <View style={styles.carddesc}>
                                            <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                                                <Text style={[styles.mutetext],{fontSize:12}}>{moment(item.created_date).format('MMMM Do YYYY')}</Text>
                                            </View>
                                            <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                                                <Text style={styles.sheading}>{item.name}</Text>
                                                {/* <Text style={[styles.mutetext],{fontSize:12,paddingLeft:15}}>{moment(item.created_date).format('MMMM Do YYYY')}</Text> */}
                                            </View>
                                            
                                            <View style={styles.rowbetween}>
                                                <View style={styles.rwrap}>
                                                   
                                                    <View style={style.rowSec}>
                                                        {rvItems}
                                                        {rvBlankItem}
                                                    
                                                    </View>
                                                    <Text style={styles.mutetext}>{item.comment}</Text>
                                                    
                                                </View>
                                                                                                
                                            </View>          
                                        </View>
                                    </View>
                                    
                                </View>
                            </View>
                            );
                            })}

                        </View>
                        :   <Text>No reviews found</Text>
                        }

                    </View>
                }
                </ScrollView>
                
            </SafeAreaView>
        )
    }
}

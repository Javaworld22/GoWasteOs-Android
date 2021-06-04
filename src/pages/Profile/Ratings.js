import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, 
    StatusBar, Image, ScrollView, TextInput, Alert,KeyboardAvoidingView,Dimensions } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import { dynamicImageURL, POST, endPoints } from "../../components/Api";
import { Retrieve } from "../../components/AsyncStorage";
import store from "../../components/redux/store/index";
import Loader from '../../components/Loader';
import StarRating from 'react-native-star-rating';
const { height } = Dimensions.get('window');
export default class Ratings extends Component {
    constructor(props){
        super(props); 
        this.state = {
            showLoader: false,
            starCount:1,
            comment:"",
            to_id:this.props.navigation.state.params.to_id,
            error:"",
            booking_id:this.props.navigation.state.params.to_id?this.props.navigation.state.params.to_id:"",
        };    
    }

    onStarRatingPress=(rating)=> {
        this.setState({
            starCount: rating
          });
      }

    rate=async()=>{
        if(this.state.comment!=""){
            this.setState({error: ""});            
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
                Alert.alert("", response.details.message, [
                    { text: "Ok", onPress:()=>{this.props.navigation.navigate('UserProfileView',{userId: this.state.to_id})}}
                ]);
                
            } else {
                this.setState({error: response.details.message});
            }
        }else{
            this.setState({error: "Please leave your comment before submit"});
        }
    }



    render() {
       
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Rate Us"
                />

                <Loader 
                    loading={this.state.showLoader} 
                />
                <KeyboardAvoidingView>
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View style={[style.container, {paddingTop:32}]}>
                            <View style={[style.pB5, {paddingTop:height * 0.2}]}>
                            <StarRating
                                disabled={false}
                                maxStars={5}
                                rating={this.state.starCount}
                                fullStarColor={'#fbc201'}
                                selectedStar={(rating) => this.onStarRatingPress(rating)}
                                buttonStyle={{marginLeft:10}}
                                containerStyle={{justifyContent: 'center',
                                alignItems: 'center',paddingBottom:18}}
                            />
                               
                                <View style={style.formControl}>
                                    <TextInput  
                                        placeholderTextColor="#acacac" 
                                        placeholder="Help us to grow with your review"
                                        style={{   
                                            height:54,   
                                            marginLeft:10,
                                            fontSize:16,
                                            width:'100%',
                                            fontFamily:'Montserrat-Regular',
                                            paddingBottom:0,
                                            paddingTop:0}}
                                        ref={ref => (this.refAddress = ref)}
                                        onChangeText={text =>this.setState({ comment: text })}
                                        multiline={true}
                                        
                                    />
                            
                                </View>
                                {this.state.error?<Text style={{color:"red"}}>{this.state.error}</Text>:null}
                                <View style={[style.mT4,style.pB5]}>
                                    <TouchableOpacity style={style.themebtn} onPress={() => this.rate()}>
                                        <Text style={style.btntext}>Submit</Text>
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

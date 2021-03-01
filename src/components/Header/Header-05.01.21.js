import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';

export default class Header extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={style.hnavigation}>
                {this.props.pageType==="homeDetails" ?
                <TouchableOpacity style={style.iconback} onPress={this.props.navigation.openDrawer}>
                    <Image source={require('../../assets/images/menubar.png')} style={style.mimg} />
                </TouchableOpacity>
                : 
                <TouchableOpacity style={style.iconback} onPress={() => this.props.navigation.goBack()}>
                    <Icon name="md-arrow-back" color="#fb6400" size={30} />
                </TouchableOpacity>
                }
                <View style={style.hwrap}>
                    <Text style={style.navh}>{this.props.label}</Text>
                    <View style={style.righticon}>
                        {this.props.label==="Profile" ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('EditProfile')}>
                                <Icon name="pencil" size={25} color="#fb6400" />
                            </TouchableOpacity>
                        :null}
                        {this.props.label==="Booking Details" &&  this.props.isEdit==true?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('BookingEdit', {bookingId:this.props.bookingId})}>
                                <Icon name="pencil" size={25} color="#fb6400" />
                            </TouchableOpacity>
                        :null}

                        {this.props.label==="Profile Details" &&  this.props.myId && this.props.to_id && this.props.to_id != this.props.myId ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Message',{to_id: this.props.to_id})}>
                                <Icon name="ios-chatbubble-ellipses-sharp" size={25} color="#fb6400" />
                            </TouchableOpacity>
                        :null}
                    </View>
                </View>
            </View>
           
        )
    }
}

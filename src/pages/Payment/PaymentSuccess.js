import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Image, ScrollView, SafeAreaView, StatusBar, } from 'react-native';
import style from '../../components/mainstyle';
import styles from './style';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';

export default class Header extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Modal 
                isVisible={this.props.showmodal}
                animationInTiming = {300}
                animationOutTiming = {300}
            >
                <View style={style.paymentsuccessmodalcenter}>

                    <View style={style.container}>
                        <View style={styles.logotop}>
                            <Image source={require('../../assets/images/thumbsup.png')} style={styles.logo} />
                        </View> 
                        <View style={styles.succbox}>
                            <Text style={styles.sheading}>Success!</Text>
                            <Text style={styles.price}>You’ve just paid </Text>
                            <Text style={styles.pricevalue}>₦{this.props.amount}</Text>
                        </View>
                        
                    </View>                          

                    <TouchableOpacity 
                        style={styles.okbtn}
                        onPress = {()=> this.props.navigation.navigate('Home')}
                    >
                        <Icon name="ios-home" color="#fff" size={22} />
                    </TouchableOpacity>
                </View>
            </Modal>
        )
    }
}

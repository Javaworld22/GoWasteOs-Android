import React, { Component, useState, useEffect } from 'react';
import { Text, View,StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import store from "../components/redux/store/index";

export default class CustomTabIcon extends Component{
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    componentDidMount = () => {
        this.unsubscribe = store.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render(){
        return(
            <View style={styles.mainTabStyle}>
                <Ionicons name={this.props.name} size={this.props.size} color={this.props.color} />

                {this.props.routeName=='Chat' && store.getState().userDetails.unreadMsgCount>0 &&
                <View style={styles.badgeViewStyle}>
                    <Text style={styles.badgeCountStyle}>
                        {store.getState().userDetails.unreadMsgCount}
                    </Text>
                </View>
                }

                {this.props.routeName=='Notification' && store.getState().userDetails.unreadNotiCount>0 &&
                <View style={styles.badgeViewStyle}>
                    <Text style={styles.badgeCountStyle}>
                        {store.getState().userDetails.unreadNotiCount}
                    </Text>
                </View>
                }
                
            </View>
        )
    }
}
  
const styles = StyleSheet.create({
    mainTabStyle:{
        width: 24, 
        height: 24, 
        margin: 5
    },
    badgeViewStyle: {
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: 'red',
        borderRadius: 7,
        width: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeCountStyle: {
        color: 'white', 
        fontSize: 10, 
        fontWeight: 'bold'
    }

});
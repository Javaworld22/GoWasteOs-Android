import React, { Component, useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import Welcome from '../pages/Welcome/Welcome';
import Splash from '../pages/Signup/Splash';
import Login from '../pages/Signup/Login';
import SignUp from '../pages/Signup/Signup';
import OtpInput from '../pages/Signup/Otp';
import ForgotPassword from '../pages/Signup/ForgotPassword';
import ResetPassword from '../pages/Signup/ResetPassword';
import Thankyou from '../pages/Signup/Thankyou';

import Sidebar from '../components/Sidebar/Sidebar';

import Home from "../pages/Home/Home";
import UserProfileView from "../pages/Profile/UserProfileView";

import Profile from '../pages/Profile/Profile';
import About from '../pages/Profile/About';
import Rating from '../pages/Profile/Ratings';
import EditProfile from '../pages/Profile/EditProfile';
import ChangePassword from '../pages/Profile/ChangePassword';

import ChatList from '../pages/Chat/Chatlist';
import Message from '../pages/Chat/Message';

import Notification from '../pages/Notification/Notification';
import Nearby from '../pages/Nearby/Nearby';
import Tracking from '../pages/Nearby/Tracking';

import JobPost from '../pages/Job/JobPost';
import JobEdit from '../pages/Job/JobEdit';
import JobList from '../pages/Job/JobList';
import JobDetails from '../pages/Job/JobDetails';

import BidHistory from '../pages/Bid/BidHistory';
import BidPost from '../pages/Bid/BidPost';

import ManualBooking from '../pages/Booking/ManualBooking';
import BookingEdit from '../pages/Booking/BookingEdit';
import BookingConfirmList from '../pages/Booking/BookingConfirmList';
import BookingConfirmation from '../pages/Booking/BookingConfirmation';
import BookingHistory from '../pages/Booking/BookingHistory';
import BookingDetails from '../pages/Booking/BookingDetails';

import MakePayment from '../pages/Payment/MakePayment';

import {Store, Retrieve, Remove} from '../components/AsyncStorage';

const AuthStack = createStackNavigator(
  {
    Splash:Splash,
    Welcome: Welcome,
    SignUp: SignUp,
    Login: Login,
    ForgotPassword: ForgotPassword,
    ResetPassword: ResetPassword,
    OtpInput: OtpInput,
    Thankyou: Thankyou
  },

  {
    initialRouteName: "Splash",
    defaultNavigationOptions: {
      headerShown: false,
      headerMode: "none"
    }
  }
);

const homeStack = createStackNavigator(
  {

    Home: { 
      screen: Home, 
      navigationOptions: { headerShown: false } 
    },
    Rating: {
      screen: Rating,
      navigationOptions:  { headerShown: false }
    },
    JobPost: { 
      screen: JobPost, 
      navigationOptions: { headerShown: false } 
    },
    BidHistory: { 
      screen: BidHistory, 
      navigationOptions: { headerShown: false } 
    },
    BidPost: { 
      screen: BidPost, 
      navigationOptions: { headerShown: false } 
    },
    ManualBooking: { 
      screen: ManualBooking, 
      navigationOptions: { headerShown: false } 
    },
    BookingConfirmation: { 
      screen: BookingConfirmation, 
      navigationOptions: { headerShown: false } 
    },
    BookingDetails: { 
      screen: BookingDetails, 
      navigationOptions: { headerShown: false } 
    },
    BookingEdit: { 
      screen: BookingEdit, 
      navigationOptions: { headerShown: false } 
    },
    UserProfileView: { 
      screen: UserProfileView, 
      navigationOptions: { headerShown: false } 
    },
    JobDetails: { 
      screen: JobDetails, 
      navigationOptions: { headerShown: false } 
    },
    JobEdit: { 
      screen: JobEdit, 
      navigationOptions: { headerShown: false } 
    },
    About: { 
      screen: About, 
      navigationOptions: { headerShown: false } 
    },
    
    
  },
  {
    initialRouteName: "Home",
   // defaultNavigationOptions: { animationEnabled: false }
  }
);

const nearbyStack = createStackNavigator(
  {
    Nearby: {
      screen: Nearby,
      navigationOptions:  { headerShown: false }
    },
  },
  {
    initialRouteName: "Nearby"
  }
);

const chatStack = createStackNavigator(
  {
    Chat: {
      screen: ChatList,
      navigationOptions:  { headerShown: false }
    },
    Message: {
      screen: Message,
      navigationOptions:  { headerShown: false }
    },
  },
  {
    initialRouteName: "Chat"
  }
);

const notificationStack = createStackNavigator(
  {
    Notification: {
      screen: Notification,
      navigationOptions:  { headerShown: false }
    },
    BookingConfirmation: { 
      screen: BookingConfirmation, 
      navigationOptions: { headerShown: false } 
    },
    BookingDetails: { 
      screen: BookingDetails, 
      navigationOptions: { headerShown: false } 
    },
    BookingEdit: { 
      screen: BookingEdit, 
      navigationOptions: { headerShown: false } 
    },
  },
  {
    initialRouteName: "Notification"
  }
);


const profileStack = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      navigationOptions:  { headerShown: false }
    },
    EditProfile: {
      screen: EditProfile,
      navigationOptions:  { headerShown: false }
    },
    Rating: {
      screen: Rating,
      navigationOptions:  { headerShown: false }
    },
    ChangePassword: {
      screen: ChangePassword,
      navigationOptions:  { headerShown: false }
    },
    JobList: { 
      screen: JobList, 
      navigationOptions: { headerShown: false } 
    },
    JobDetails: { 
      screen: JobDetails, 
      navigationOptions: { headerShown: false } 
    },
    JobEdit: { 
      screen: JobEdit, 
      navigationOptions: { headerShown: false } 
    },
    BookingConfirmList: { 
      screen: BookingConfirmList, 
      navigationOptions: { headerShown: false } 
    },
    BookingConfirmation: { 
      screen: BookingConfirmation, 
      navigationOptions: { headerShown: false } 
    },
    BookingHistory: { 
      screen: BookingHistory, 
      navigationOptions: { headerShown: false } 
    },
    BookingDetails: { 
      screen: BookingDetails, 
      navigationOptions: { headerShown: false } 
    },
    BookingEdit: { 
      screen: BookingEdit, 
      navigationOptions: { headerShown: false } 
    },
    UserProfileView: { 
      screen: UserProfileView, 
      navigationOptions: { headerShown: false } 
    },
    Rating: {
      screen: Rating,
      navigationOptions:  { headerShown: false }
    },
    BidHistory: { 
      screen: BidHistory, 
      navigationOptions: { headerShown: false } 
    },
    Tracking: { 
      screen: Tracking, 
      navigationOptions: { headerShown: false } 
    },
    MakePayment: { 
      screen: MakePayment, 
      navigationOptions: { headerShown: false } 
    },

  },
  {
    initialRouteName: "Profile"
  }
);


const bottomTab = createBottomTabNavigator(
  {
    Home: { screen: homeStack },
    Nearby: { screen: nearbyStack },
    Chat: { screen: chatStack },   
    Notification: { screen: notificationStack },
    Profile: { screen: profileStack },
  },
  { 
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === 'Home') {
          iconName = `ios-home`;
        } else if (routeName === 'Nearby') {
          iconName = `md-location-outline`;
        }else if(routeName === 'Chat'){
          iconName = `md-chatbox-outline`;
        } else if(routeName === 'Notification'){
          iconName = `notifications-outline`;
        } else if (routeName === 'Profile') {
          iconName = `md-person-sharp`;
        }
          return <IconComponent name={iconName} size={20} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: '#fd5b29', 
      inactiveTintColor: '#c9c9c9',
      style:{height:55, 
          borderTopColor:'transparent', 
          borderTopWidth:0, 
          backgroundColor:'#fff'
      },       
      labelStyle:{
        fontSize:12,
        textTransform:'uppercase',
        fontFamily:'Montserrat-Bold',
        fontWeight:'bold'
      },
      tabStyle: {
        paddingTop:5,   
        paddingBottom:5         
      }
    },
  }
);

const DrawerStack = createDrawerNavigator(
  {
    Dashboard: bottomTab,
  },
  {
    initialRouteName: "Dashboard",
    contentComponent: props => <Sidebar {...props} />,
      drawerType:'front',
      //drawerWidth: 260,
      drawerLockMode:'unlocked', 
      // hideStatusBar:'true',
      drawerBackgroundColor:'transparent'
  }
);

const AppContainer = createSwitchNavigator(
  {
    Auth: AuthStack,
    DrawerStack
  },
  {
    initialRouteName: "Auth"
  }
);

const App =createAppContainer(AppContainer)
export default App;
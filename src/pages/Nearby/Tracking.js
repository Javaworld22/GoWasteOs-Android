import React, { Component } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, TextInput, Dimensions,StyleSheet,Alert,Platform } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST,googleApiKey,SOCKETSERVER} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import { NavigationEvents } from 'react-navigation';
import store from "../../components/redux/store/index";
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import MapView, {Marker,AnimatedRegion,Polyline,PROVIDER_GOOGLE} from "react-native-maps";
import MapViewDirections from 'react-native-maps-directions';
import moment from "moment";
import io from 'socket.io-client';

const screen = Dimensions.get('window');
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.011;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
// const LATITUDE_DELTA = 0.003;
// const LONGITUDE_DELTA = 0.003;
const LATITUDE = Number(store.getState().userDetails.lattitude);
const LONGITUDE = Number(store.getState().userDetails.longitude);

export default class Tracking extends Component {
  
    constructor(props) {
      super(props);
      this.carMarkerRef = React.createRef();
      this.mapRef = React.createRef();
      this.state = {
        showLoader: false,
        showMap: false,
        usertype:'',
        userSocketId:'',
        locationUserList: Array(),
        tripStatus:1,
        bookingId: this.props.navigation.state.params.bookingId,
        providerLocation: {
          latitude: 37.3318456, 
          longitude: -122.0296002
        },
        jobLocation: {
          latitude: this.props.navigation.state.params.lat, 
          longitude: this.props.navigation.state.params.long
        },
        carLocation: {
          latitude: 37.3318456, 
          longitude: -122.0296002
        },
        currentLocation: new AnimatedRegion({
          latitude: LATITUDE, 
          longitude: LONGITUDE,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        }),

        
      };
    }
  

    componentDidMount = async () => { 
      this.startTrackingFunctions();
    };

    startTrackingFunctions = async () => {
      this.setState({usertype: await Retrieve('userType')},
        () => {

          if(this.state.usertype ==='SP'){
            this.providerSection();
          } else {
            this.customerSection();
          }
        }
      );
    }

    providerSection = async() => {
      this.addTracking();
    }

    customerSection = async() => {
      this.getTrackingDetails();
    }

    configureSocket = async() => {

      var socket = io(SOCKETSERVER);
      socket.on('connect', () => {
        let userInfo = {
          id:  socket.id,
          bookingId: this.state.bookingId
        }
        this.setState({userSocketId:socket.id});
        socket.emit('addTracking', userInfo);
      })

      socket.on('locationUserList', (locationUserList) => {
        var id = socket.id;
        this.setState({locationUserList:locationUserList});
        if(this.state.locationUserList.length>0){
            let filteruserArr = this.state.locationUserList.filter(item => item.id != id)
            this.setState({locationUserList:filteruserArr});
        }
      })

      socket.on('getCurrentLocation', data => {
        // console.log("rcvLocation",data);  
        if(data.bookingId == this.state.bookingId){
          //Animate map
          if(this.state.usertype === 'C'){

            this.setState({
              carLocation: {
                latitude: data.latitude,
                longitude: data.longitude
              },
              currentLocation: new AnimatedRegion({
                latitude: data.latitude,
                longitude: data.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
              })
              
            },
              () => {
                //Animate map
                this._animateToMapRegion(data.latitude, data.longitude);
              }
            );
            
          }
        }
      })

      socket.on('quit', (id) => {
        if(this.state.locationUserList.length>0){
            let filteruserArr = this.state.locationUserList.filter(item => item.id != id)
            this.setState({locationUserList:filteruserArr});
        }
      })
      
      
      this.socket = socket;
    }

    addTracking = async() => {

      let formData = new FormData();
      formData.append('booking_id', this.state.bookingId);
      formData.append('service_provider_id', await Retrieve("userId"));
      formData.append('destination_lat', this.state.jobLocation.latitude);
      formData.append('destination_long', this.state.jobLocation.longitude);
      formData.append('source_lat', store.getState().userDetails.lattitude);
      formData.append('source_long', store.getState().userDetails.longitude);
      formData.append('last_lat', store.getState().userDetails.lattitude);
      formData.append('last_long', store.getState().userDetails.longitude);
      formData.append('is_ongoing', 1);
      formData.append('startTime', moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
      
      // console.log(formData);
      this.setState({showLoader: true});
      let response = await POST(endPoints.addTracking, formData, {
        Authorization: await Retrieve("userToken")
      });
      this.setState({showLoader: false});
      // console.log(response);
      this.getTrackingDetails();
    }

    getTrackingDetails = async() => {
      let formData = new FormData();
      formData.append('booking_id', this.state.bookingId);
      this.setState({showLoader: true});
      let response = await POST(endPoints.fetchTracking, formData, {
        Authorization: await Retrieve("userToken")
      });
      this.setState({showLoader: false});
      // console.log(Number(response.details.trip.destination_lat));
      if (response.details.ack == '1') {
        this.setState({
          tripStatus: response.details.trip.is_ongoing,
          jobLocation: {
            latitude: Number(response.details.trip.destination_lat),
            longitude: Number(response.details.trip.destination_long)
          },
          providerLocation: {
            latitude: Number(response.details.trip.source_lat),
            longitude: Number(response.details.trip.source_long)
          },
          carLocation: {
            latitude: Number(response.details.trip.last_lat),
            longitude: Number(response.details.trip.last_long)
          },
          currentLocation: new AnimatedRegion({
            latitude: Number(response.details.trip.last_lat),
            longitude: Number(response.details.trip.last_long),
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }),
        },
          () => {
            this.setState({showMap:true});
            //Configure socket
            this.configureSocket();
            if(this.state.usertype === 'SP'){
              // this.findCoordinatesNew();
              this.interval = setInterval(
                () => {
                  this.findCoordinates();
                }
              , 5000);
            }
          }
        );

      }
    }


    findCoordinates = async() => {
        const { currentLocation } = this.state;
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            'title': 'Location Permission',
            'message': 'GoWasteOs needs access to your location '
          })

        if (granted) {
          Geolocation.getCurrentPosition(
            (position) => {
              // console.log("current position",position.coords);
             
              const { latitude, longitude } = position.coords;
              const newCoordinate = {latitude,longitude};
              
              if(this.state.currentLocation.latitude != position.coords.latitude  && this.state.currentLocation.longitude != position.coords.longitude){

                this.setState({
                  carLocation: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  },
                  currentLocation: new AnimatedRegion({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                  }),
                  
                },
                  () => {
                    //Animate map
                    this._animateToMapRegion(position.coords.latitude, position.coords.longitude);
  
                    //Send coordinate to socket
                    var resuserArr = Array();
                    if(this.state.locationUserList.length>0){
                      resuserArr = this.state.locationUserList.filter(item => item.bookingId == this.state.bookingId);
                    }
                    if(resuserArr.length>0){
                      var locationInfo = {
                        id: resuserArr[0].id,
                        bookingId: this.state.bookingId, 
                        latitude: position.coords.latitude, 
                        longitude: position.coords.longitude, 
                      }
                    } else {
                      var locationInfo = {
                        id: '',
                        bookingId: this.state.bookingId, 
                        latitude: position.coords.latitude, 
                        longitude: position.coords.longitude, 
                      }
                    }
                    
                    this.socket.emit('sendCurrentLocation', locationInfo);
                    
                    //Update coordinate
                    this.updateTracking(position.coords.latitude, position.coords.longitude);
                  }
                );
              }
              

            },

            (error) => {
              console.log(error.code, error.message);
            },

            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );              
        }
    };

    findCoordinatesNew = async() => {
      const { currentLocation } = this.state;
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Location Permission',
          'message': 'GoWasteOs needs access to your location '
        })

      if (granted) {

        this.watchID = Geolocation.watchPosition(
          (position) => {
            console.log('position',position);

            const { routeCoordinates } = this.state;
            const { latitude, longitude } = position.coords;
            const newCoordinate = {latitude,longitude};
              
            if(this.state.currentLocation.latitude != position.coords.latitude  && this.state.currentLocation.longitude != position.coords.longitude){

              this.setState({
                currentLocation: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                },
                // routeCoordinates: routeCoordinates.concat([newCoordinate]),
                prevLatLng: newCoordinate
              },
                () => {
                  //Animate map
                  this._animateToMapRegion(position.coords.latitude, position.coords.longitude);

                  //Send coordinate to socket
                  var resuserArr = Array();
                  if(this.state.locationUserList.length>0){
                    resuserArr = this.state.locationUserList.filter(item => item.bookingId == this.state.bookingId);
                  }
                  if(resuserArr.length>0){
                    var locationInfo = {
                      id: resuserArr[0].id,
                      bookingId: this.state.bookingId, 
                      latitude: position.coords.latitude, 
                      longitude: position.coords.longitude, 
                    }
                  } else {
                    var locationInfo = {
                      id: '',
                      bookingId: this.state.bookingId, 
                      latitude: position.coords.latitude, 
                      longitude: position.coords.longitude, 
                    }
                  }
                  
                  this.socket.emit('sendCurrentLocation', locationInfo);
                  
                  //Update coordinate
                  this.updateTracking(position.coords.latitude, position.coords.longitude);
                }
              );
            }

          },
          error => console.log(error),
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000,
            distanceFilter: 1
          }
        );              
      }
    };

    componentWillUnmount() {
      if(this.state.usertype === 'SP'){
        clearInterval(this.interval);
        // Geolocation.clearWatch(this.watchID);
      }
    }
    
    // getMapRegion = () => ({
    //   latitude: this.state.currentLocation.latitude,
    //   longitude: this.state.currentLocation.longitude,
    //   latitudeDelta: LATITUDE_DELTA,
    //   longitudeDelta: LONGITUDE_DELTA
    // });

    _animateToMapRegion = (lat,lng) => {
      const newAnimatedCoords = new AnimatedRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      });

      this.mapRef.current.animateToRegion({
        latitude: this.state.carLocation.latitude,
        longitude: this.state.carLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      })

      if (Platform.OS === "android") {
        this.carMarkerRef.current.animateMarkerToCoordinate(newAnimatedCoords,5000);
      } else {
        this.state.currentLocation.timing(newAnimatedCoords).start();
      }

      // this._map.animateCamera({center: newCoords,pitch: 2, heading: 20,altitude: 200, zoom: 40},10);
    }

    updateTracking = async(latitude,longitude) => {
      let formData = new FormData();
      formData.append('booking_id', this.state.bookingId);
      formData.append('last_lat', latitude);
      formData.append('last_long', longitude);
      formData.append('is_ongoing', 1);
      
      // console.log(formData);
      let response = await POST(endPoints.updateTracking, formData, {
        Authorization: await Retrieve("userToken")
      });
      // console.log(response);
    }

    endTrip = async() => {
      Alert.alert("", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "Yes",
          onPress: async () => {
            let formData = new FormData();
            formData.append('booking_id', this.state.bookingId);
            formData.append('last_lat', this.state.carLocation.latitude);
            formData.append('last_long', this.state.carLocation.longitude);
            formData.append('is_ongoing', 2);
            formData.append('endTime', moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
            
            // console.log(formData);
            this.setState({ showLoader: true });
            let response = await POST(endPoints.updateTracking, formData, {
              Authorization: await Retrieve("userToken")
            });
            this.setState({ showLoader: false });
            // console.log(response);
            if (response.details.ack == 1) {
              Alert.alert("", "Service completed successfully", [
                  { text: "Ok", onPress: () => this.props.navigation.navigate('BookingDetails',{bookingId: this.state.bookingId})}
              ]);
            } else {
              Alert.alert("", response.details.message, [
                  { text: "Ok"}
              ]);
            }
            
          }
        }
      ]);
      
    }

    render() {
        
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Tracking"
                />

                <Loader 
                    loading={this.state.showLoader} 
                />

                <NavigationEvents
                    onDidFocus={() =>this.startTrackingFunctions()}
                />
                {this.state.showMap &&
                <View style={style.container}>
                    <MapView
                        style={{flex:1}}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                          ...this.state.carLocation,
                          latitudeDelta: LATITUDE_DELTA,
                          longitudeDelta: LONGITUDE_DELTA,
                        }}
                        ref={this.mapRef}
                    >
                        
                      {/* <Marker
                        coordinate={this.state.providerLocation} 
                      /> */}
                      <Marker
                        coordinate={this.state.jobLocation} 
                      />
                      <Marker.Animated 
                        ref={this.carMarkerRef}
                        coordinate={this.state.currentLocation} 
                      >
                        <Image source={require('../../assets/images/map-car.png')} style={{height: 22, width:25 }} />
                      </Marker.Animated>
                      

                      <MapViewDirections
                        origin={this.state.carLocation}
                        destination={this.state.jobLocation}
                        apikey={googleApiKey}
                        strokeWidth={5}
                        strokeColor="#1273de"
                        resetOnChange ={false}
                        
                  
                      />
                      
                      {/* <Polyline 
                        coordinates={this.state.routeCoordinates} 
                        strokeWidth={10}
                        strokeColor="#1273de" 
                      /> */}

                    </MapView>

                    
                    {this.state.usertype == 'SP' && this.state.tripStatus == 1 &&
                    <View style={styles.mapbtnContainer}>
                      <TouchableOpacity
                        style={[style.smbtn, {backgroundColor:'#fb6400',}]}
                        onPress={() => this.endTrip()}
                      >
                        <Text style={style.smbtntext}>Complete Service</Text>
                      </TouchableOpacity>
                    </View>
                    }

                    {this.state.usertype == 'SP' && this.state.tripStatus == 2 &&
                    <View style={styles.mapbtnContainer}>
                      <View style={[style.smbtn, {backgroundColor:'#00bcd4'}]}>
                        <Text style={style.smbtntext}>Service is completed</Text>
                      </View>
                      <TouchableOpacity
                        style={[style.smbtn, {backgroundColor:'#fb6400',}]}
                        onPress={() => this.props.navigation.navigate('BookingDetails',{bookingId: this.state.bookingId})}
                      >
                        <Text style={style.smbtntext}>Go Back</Text>
                      </TouchableOpacity>
                    </View>
                    }

                    {this.state.tripStatus == 2 && this.state.usertype == 'C' &&
                    <View style={styles.mapbtnContainer}>
                      <View style={[style.smbtn, {backgroundColor:'#00bcd4'}]}>
                        <Text style={style.smbtntext}>Garbage Collected Successfully</Text>
                      </View>
                      <TouchableOpacity
                        style={[style.smbtn, {backgroundColor:'#fb6400',}]}
                        onPress={() => this.props.navigation.navigate('MakePayment',{bookingId: this.state.bookingId})}
                      >
                        <Text style={style.smbtntext}>Make Payment</Text>
                      </TouchableOpacity>
                    </View>
                    }


                </View>
                }
                
            </SafeAreaView>
            
            
        )
    }
}



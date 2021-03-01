import React, { Component } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, TextInput, Dimensions,StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import { NavigationEvents } from 'react-navigation';
import store from "../../components/redux/store/index";
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import moment from "moment";
import MapView, {PROVIDER_GOOGLE,Marker,Callout} from 'react-native-maps';


export default class Nearby extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showLoader: false,
            mapUserList:{},
            initialLocation: {
            },
            showMap: false,
            
        };
    }

    componentDidMount = async () => { 
        this.getMapUsers();
        this.findCoordinates();
    };

    getMapUsers = async() => {
        let formDatas = new FormData();
        formDatas.append('user_id', await Retrieve("userId"));
        formDatas.append('date', moment(new Date()).format('YYYY-MM-DD'));
        formDatas.append('time', moment(new Date()).format('HH:mm:ss'));

        this.setState({showLoader: true});
        let responses = await POST(endPoints.nearByMapUsers, formDatas, {
            Authorization: await Retrieve("userToken")
        });

        this.setState({showLoader: false});
        //  console.log(responses.details.users);
        //  console.log(responses);
        
        if (responses.details.ack == '1') {
            var resuserarray=responses.details.users;
            resuserarray.forEach(data => {
                for(let key in data) Number.isNaN(+data[key]) || (data[key] = +data[key])
            });
            
            let dynamicusersArr = [];
            for (var i = 0; i < resuserarray.length; i++) {
                let custmdata = {
                    id:resuserarray[i].id,
                    name:resuserarray[i].firstName+' '+resuserarray[i].lastName,
                    image:resuserarray[i].profilePicture,
                    coordinate: {
                        latitude: resuserarray[i].lattitude,
                        longitude: resuserarray[i].longitude,
                    }
                }
                dynamicusersArr.push(custmdata);
            }  
            // console.log('helllodddooooo',dynamicusersArr)
            this.setState({mapUserList: dynamicusersArr});
        }
    }

    findCoordinates = async() => {
        //Grant the permission for Location
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                'title': 'Location Permission',
                'message': 'GoWasteOs needs access to your location '
            })

        if (granted) {
            Geolocation.getCurrentPosition(
                (position) => {
                    this.setCurrentRegion(position.coords.latitude.toString(),position.coords.longitude.toString());
                },
                (error) => {
                    // See error code charts below.
                    console.log(error.code, error.message);
                    this.setNormalRegion();
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );              
            this.watchID = Geolocation.watchPosition((lastPosition) => {
            });
        } else {
            this.setNormalRegion();
        }
    };

    setCurrentRegion = (lattitude,longitude)=> {
        this.setState({
            showMap:true,
            initialLocation: {
                latitude: Number(lattitude),
                longitude: Number(longitude),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }
        });
    }

    setNormalRegion = ()=> {

        if(store.getState().userDetails && (store.getState().userDetails.lattitude =="" || store.getState().userDetails.longitude =="" || store.getState().userDetails.lattitude ==null || store.getState().userDetails.longitude ==null)){
            this.setState({
                showMap:true,
                initialLocation: {
                    latitude: 9.0820,
                    longitude: 8.6753,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                }
            });
        }else{
            this.setState({
                showMap:true,
                initialLocation: {
                    latitude: Number(store.getState().userDetails.lattitude),
                    longitude: Number(store.getState().userDetails.longitude),
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                }
            }); 
        }

        
    }

    render() {
        // console.log(this.state.initialLocation);
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="homeDetails"
                    label="Map View"
                />

                <Loader 
                    loading={this.state.showLoader} 
                />

                <NavigationEvents
                    onDidFocus={() =>this.findCoordinates()}
                />

                <View style={style.container}>
                    {this.state.showMap &&
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={{flex:1}}
                            showsUserLocation={true}
                            followsUserLocation={true}
                            showsCompass={true}
                            initialRegion={this.state.initialLocation}
                        >

                            {this.state.mapUserList && this.state.mapUserList.length > 0 ? this.state.mapUserList.map((item, index) => {
                                return (
                                        <Marker
                                            key={index}
                                            coordinate={item.coordinate}
                                            
                                        >
                                            <Callout tooltip>
                                                <View>
                                                    <View style={styles.mapbubble}>
                                                        
                                                        <Text style={styles.imgbx}>
                                                            <Image 
                                                                style={styles.mimg}
                                                                source={{ uri: item.image && item.image.includes("https://")?item.image:dynamicImageURL +'/'+ item.image }}
                                                            />
                                                        </Text>
                                                        <Text style={styles.mtext}>{item.name}</Text>
                                                    </View>
                                                    <View style={styles.calloutarrowBorder} />
                                                    <View style={styles.calloutarrow} />
                                                </View>
                                            </Callout>
                                        </Marker>
                                    );
                            }):<></>}
                        </MapView>
                    }
                </View>
                
            </SafeAreaView>
            
            
        )
    }
}



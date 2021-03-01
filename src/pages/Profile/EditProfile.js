import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, 
    StatusBar, Image, ScrollView, TextInput, Alert,KeyboardAvoidingView } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import { dynamicImageURL, POST, endPoints, googleApiKey } from "../../components/Api";
import { Retrieve } from "../../components/AsyncStorage";
import store from "../../components/redux/store/index";
import {setUserDetails} from "../../components/redux/action/index";
import ImagePicker from 'react-native-image-crop-picker';
import Loader from '../../components/Loader';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Modal from 'react-native-modal';

export default class EditProfile extends Component {
    constructor(props){
        super(props); 
        this.myRef = React.createRef();
        this.state = {
            profileDetails: [],
            firstName: '',
            lastName: '',
            phone:'',
            address: '',
            lattitude:"",
            longitude:"",
            profilePicture: {},
            isFirstNameError: false,
            isLastNameError: false,
            isPhoneError: false,
            isAddressError: false,
            isFirstNameValidError: false,
            isLastNameValidError: false,
            isPhoneValidError: false,
            isPhoneValidError2:false,
            isUpdating: false,
            isApiError: false,
            apiMessage: '',
            filePath:{},
            showLoader: false,
            userDetails: {},
            modalVisible:false,
        };    
    }

    componentDidMount = () => {
        this.setState({ userDetails: store.getState().userDetails },
            () => {
                this.myRef.current.setAddressText(this.state.userDetails.address!=null?this.state.userDetails.address:"");
            });
        //this.setState({ userDetails: store.getState().userDetails });
        //this.unsubscribe = store.subscribe(() => this.forceUpdate());
        this.setState({
            profileDetails:store.getState().userDetails,
            firstName:
                store.getState().userDetails.firstName !==''
                ? store.getState().userDetails.firstName
                : '',
            lastName:
                store.getState().userDetails.lastName !==''
                ? store.getState().userDetails.lastName
                : '',
            phone:
                store.getState().userDetails.phoneNumber !==''
                ? store.getState().userDetails.phoneNumber
                : '',
            address:
                store.getState().userDetails.address !==''
                ? store.getState().userDetails.address
                : '',
            lattitude:
                store.getState().userDetails.lattitude !==''
                ? store.getState().userDetails.lattitude
                : '',
            longitude:
                store.getState().userDetails.longitude !==''
                ? store.getState().userDetails.longitude
                : '',
            oldimg:
                store.getState().userDetails.profilePicture !==''
                ? store.getState().userDetails.profilePicture
                : '',
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (store.getState().userDetails !== this.state.userDetails) {
            this.setState({ userDetails: store.getState().userDetails });
          //console.log('pokemons state has changed.', store.getState().userDetails)
        }
    }

    toggleModal = () => {
        this.setState({modalVisible: !this.state.modalVisible});
    }

    selectImgGallery = () => {
        this.setState({modalVisible: !this.state.modalVisible});
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true
        }).then(image => {
            this.setState({
                profilePicture: {
                    uri: image.path,
                    name: image.path.split("Pictures/")[1],
                    type: "image/*"
                }
            });
            
            this.uploadImage();
        });
    }

    selectImgCamera = () => {
        this.setState({modalVisible: !this.state.modalVisible});
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            this.setState({
                profilePicture: {
                    uri: image.path,
                    name: image.path.split("Pictures/")[1],
                    type: "image/*"
                }
            });
            
            this.uploadImage();
        });
    }

    // chooseFile = () => {
    //     var options = {
    //       title: 'Select Image',
    //       storageOptions: {
    //         skipBackup: true,
    //         path: 'images',
    //       },
    //     };
    //     ImagePicker.showImagePicker(options, response => {
    //         // console.log('Response = ', response);
    //         if (response.didCancel) {
    //             console.log('User cancelled image picker');
    //         } else if (response.error) {
    //             console.log('ImagePicker Error: ', response.error);
    //         } else {
    //             let source = response;
    //             // You can also display the image using data:
    //             // let source = { uri: 'data:image/jpeg;base64,' + response.data };
    //             this.setState({
    //                 profilePicture: {
    //                     uri: source.uri,
    //                     name: source.fileName,
    //                     type: "image/*"
    //                 }
    //             });

    //             this.uploadImage();
    //         }
    //     });    
    // };

    uploadImage=async()=>{
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        formData.append(
            "profilePicture",
            Object.keys(this.state.profilePicture).length == 0
                ? this.state.userDetails.profilePicture !== ""
                    ? this.state.userDetails.profilePicture
                    : ""
                : this.state.profilePicture
        );
        formData.append("oldimg",this.state.userDetails.profilePicture);
        // console.log("formData ", formData);
        this.setState({showLoader: true});
        let response = await POST(endPoints.updateProfile, formData, {
          Authorization: await Retrieve("userToken")
        });
        this.setState({ showLoader: false });
        // console.log("response ", response);
        if (response.ack == 1) {
            let formData = new FormData();
            formData.append('user_id', await Retrieve("userId"));
            let res = await POST(endPoints.profileDetails, formData, {
                Authorization: await Retrieve("userToken")
            });
            if (res.ack == 1) {
                store.dispatch(setUserDetails(res.details));
                this.forceUpdate();
                
            } else {
                console.log("Error in 'fetchProfileDetails' api");
            }
        } else {
            this.setState({isApiError: true, apiMessage: response.message});
        }
    }

    _updateProfile = async () => {
        var phonenoRegx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

        this.setState({ isApiError: false });
    
        if (this.state.firstName.trim() === '') {
            this.setState({isFirstNameError: true});
            this.refFirstName.focus();
            return;
        } else {
            this.setState({isFirstNameError: false});
            if(/[!@#$%^&*(),.?":{}|<>]/g.test(this.state.firstName) || /\d+/g.test(this.state.firstName)) {
                this.setState({isFirstNameValidError: true});
                this.refFirstName.focus();
                return;
            } else {
                this.setState({isFirstNameValidError: false});
            }
        }

        if (this.state.lastName.trim() === '') {
            this.setState({isLastNameError: true});
            this.refLastName.focus();
            return;
        } else {
            this.setState({isLastNameError: false});
            if(/[!@#$%^&*(),.?":{}|<>]/g.test(this.state.lastName) || /\d+/g.test(this.state.lastName)) {
                this.setState({isLastNameValidError: true});
                this.refLastName.focus();
                return;
            } else {
                this.setState({isLastNameValidError: false});
            }
        }
        
        if (this.state.phone === '' || this.state.phone === 0 || this.state.phone === null) {
            this.setState({ isPhoneError: true });
            this.refPhone.focus();
            return;
        } else {
            
            this.setState({ isPhoneError: false });
            if(this.state.phone.indexOf('0')!==0){
                this.setState({ isPhoneValidError2: true });
                this.refPhone.focus();
                return;
            } else {
                this.setState({ isPhoneValidError2: false });
                var newphno = Number(this.state.phone);
                var newphnoString = newphno.toString();
                console.log(newphnoString);
                if (!newphnoString.match(phonenoRegx)) {
                    this.setState({ isPhoneValidError: true });
                    this.refPhone.focus();
                    return;
                } else {
                    this.setState({ isPhoneValidError: false });
                }
            }
        }
    
        if (this.state.address === "" || this.state.address === null) {
            this.setState({ isAddressError: true });
            return;
        } else {
            this.setState({ isAddressError: false });
        }
    
        this.setState({
            isFirstNameError: false,
            isLastNameError: false,
            isFirstNameValidError: false,
            isLastNameValidError: false,
            isPhoneValidError: false,
            isPhoneValidError2: false,
            isPhoneError: false,
            isAddressError: false,
            isApiError: false
        });
    
        let formData = new FormData();
        formData.append('user_id', await Retrieve("userId"));
        formData.append(
            "firstName",
            this.state.firstName !== ""
                ? this.state.firstName
                : store.getState().userDetails.firstName
        );
        formData.append(
            "lastName",
            this.state.lastName !== ""
                ? this.state.lastName
                : store.getState().userDetails.lastName
        );
        formData.append(
            "phoneNumber",
            this.state.phone !== ''
                ? this.state.phone
                : store.getState().userDetails.phoneNumber
        );
        formData.append(
            "address",
            this.state.address !== ""
              ? this.state.address
              : store.getState().userDetails.address
        );
        formData.append(
            "lattitude",
            this.state.lattitude !== ""
              ? this.state.lattitude
              : store.getState().userDetails.lattitude
        );
        formData.append(
            "longitude",
            this.state.longitude !== ""
              ? this.state.longitude
              : store.getState().userDetails.longitude
        );
        // formData.append(
        //     "profilePicture",
        //     Object.keys(this.state.profilePicture).length == 0
        //         ? this.state.profileDetails.profilePicture !== ""
        //             ? this.state.profileDetails.profilePicture
        //             : ""
        //         : this.state.profilePicture
        // );
        // formData.append("oldimg",this.state.profileDetails.profilePicture);
    
        this.setState({showLoader: true});
        let response = await POST(endPoints.updateProfile, formData, {
          Authorization: await Retrieve("userToken")
        });
        this.setState({ showLoader: false });
        // console.log("Response ", formData);
        // console.log("Response ", response);
    
        if (response.ack == 1) {
            let formData = new FormData();
            formData.append('user_id', await Retrieve("userId"));
            let res = await POST(endPoints.profileDetails, formData, {
                Authorization: await Retrieve("userToken")
            });
            if (res.ack == 1) {
                store.dispatch(setUserDetails(res.details));
                this.forceUpdate();
                Alert.alert("", "Profile details has been updated successfully.", [
                { text: "Ok", onPress: () => this.props.navigation.goBack() }
                ]);
            } else {
                console.log("Error in 'fetchProfileDetails' api");
            }
        } else {
            this.setState({isApiError: true, apiMessage: response.message});
        }
    };

    render() {
        const {profileDetails} = this.state;
        
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="Edit Profile"
                />

                <Loader 
                    loading={this.state.showLoader} 
                />

                <Modal 
                    isVisible={this.state.modalVisible}
                    
                    animationOutTiming={1000}
                    style={{justifyContent: 'flex-end',margin: 0}}
                >
                    <View style={styles.imagemodalcenter}>
                        
                        <Text style={styles.imagemodalheading}>Select Image</Text>

                        <TouchableOpacity style={styles.imagemodalthemebtn} onPress={this.selectImgCamera}>
                            <Text style={styles.imagemodalbtntext}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.imagemodalthemebtn} onPress={this.selectImgGallery}>
                            <Text style={styles.imagemodalbtntext}>Choose From Library</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.imagemodalthemebtn} onPress={this.toggleModal}>
                            <Text style={styles.imagemodalbtntext}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>

                <KeyboardAvoidingView>
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View style={[style.container, styles.flextopprofile]}>
                            <View style={styles.profilewrap}>
                                <View style={styles.profileimgwrap} >
                                    { store.getState().userDetails.profilePicture!==''?
                                    <Image 
                                        source={{
                                            uri:
                                            store.getState().userDetails.profilePicture && store.getState().userDetails.profilePicture.includes("https://")?store.getState().userDetails.profilePicture: dynamicImageURL + "/" + store.getState().userDetails.profilePicture
                                        }} 
                                        //source={{uri: dynamicImageURL + "/" + this.state.profilePicture}} 
                                        style={styles.profileimg} 
                                    />
                                    : 
                                    <Image 
                                        source={{
                                            uri:
                                                Object.keys(this.state.profilePicture).length != 0
                                                ? this.state.profilePicture.uri
                                                : dynamicImageURL + "/img/no-image.jpg"
                                        }}  
                                        //source={{uri: dynamicImageURL + "/img/no-image.jpg"}}
                                        style={styles.profileimg} />
                                    }
                                    
                                    <TouchableOpacity 
                                        style={styles.profilebadge}
                                        onPress={() => this.toggleModal()}
                                    >
                                        <Icon name="camera" color="#1cae81" size={20} />
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <View style={[style.mT2,style.pB5]}>
                                
                                <Text style={styles.label}>First Name</Text>
                                <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="First Name" 
                                        placeholderTextColor="#acacac" 
                                        style={style.forminput}
                                        defaultValue={this.state.userDetails.firstName}
                                        ref={ref => (this.refFirstName = ref)}
                                        onChangeText={text =>this.setState({ firstName: text })}
                                    />
                                </View>
                                {(this.state.isFirstNameError || this.state.isFirstNameValidError) && (
                                    <Text style={style.errorMsg}>
                                        {this.state.isFirstNameError
                                        ? 'This field is required'
                                        : 'First name is not valid'}
                                    </Text>
                                )}

                                <Text style={styles.label}>Last Name</Text>
                                <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="Last Name" 
                                        placeholderTextColor="#acacac" 
                                        style={style.forminput}
                                        defaultValue={this.state.userDetails.lastName}
                                        ref={ref => (this.refLastName = ref)}
                                        onChangeText={text =>this.setState({ lastName: text })}
                                    />
                                </View>
                                {(this.state.isLastNameError || this.state.isLastNameValidError) && (
                                    <Text style={style.errorMsg}>
                                        {this.state.isLastNameError
                                        ? 'This field is required'
                                        : 'Last name is not valid'}
                                    </Text>
                                )}

                                <Text style={styles.label}>Email</Text>
            
                                {this.state.userDetails.email ?
                                    <View style={style.roundinput}>
                                        {this.state.userDetails.email.length >20 ?
                                        <Text style={{paddingTop:5,marginLeft:5,fontSize:16,width:'75%',fontFamily:'Montserrat-Regular',height:40,paddingBottom:5}}>
                                            {this.state.userDetails.email.substring(0,20)}...
                                        </Text>
                                        :<Text style={{paddingTop:5,marginLeft:5,fontSize:16,width:'75%',fontFamily:'Montserrat-Regular',height:40,paddingBottom:5}}>
                                            {this.state.userDetails.email}
                                        </Text>}
                                    </View>
                                    : <View style={style.roundinput}></View>
                                }

                                <Text style={styles.label}>Phone No</Text>
                                {!this.state.userDetails.email && this.state.userDetails.phoneNumber ?
                                
                                    <View style={style.roundinput}>
                                        <Text style={{paddingTop:5,marginLeft:5,fontSize:16,width:'75%',fontFamily:'Montserrat-Regular',height:40,paddingBottom:5}}>
                                            {this.state.userDetails.phoneNumber.substring(0,20)}...
                                        </Text>
                                    </View>
                                    : 
                                    <View style={style.roundinput}>
                                    <TextInput  
                                        placeholder="Phone No" 
                                        placeholderTextColor="#acacac" 
                                        keyboardType='phone-pad'
                                        style={style.forminput}
                                        defaultValue={this.state.userDetails.phoneNumber}
                                        ref={ref => (this.refPhone = ref)}
                                        onChangeText={text =>this.setState({ phone: text })}
                                        />
                                    </View>
                                }
                                {!this.state.userDetails.email && this.state.userDetails.phoneNumber && (this.state.isPhoneError || this.state.isPhoneValidError) && (
                                    <Text style={style.errorMsg}>
                                        {this.state.isPhoneError
                                        ? 'This field is required'
                                        : 'Phone number should be 10 numbers'}
                                    </Text>
                                )}
                                {this.state.isPhoneValidError2 && (
                                    <Text style={style.errorMsg}>
                                    Phone number should be started with 0
                                    </Text>
                                )}


                                <Text style={styles.label}>Location</Text>
                                <View style={style.roundinput}>
                                    {/* <TextInput  
                                        placeholder="Location" 
                                        placeholderTextColor="#acacac" 
                                        style={style.formControlInput}
                                        defaultValue={this.state.userDetails.address}
                                        ref={ref => (this.refAddress = ref)}
                                        onChangeText={text =>this.setState({ address: text })}
                                    /> */}
                                    
                                    <GooglePlacesAutocomplete
                                        placeholder="Address"
                                        fetchDetails = {true}
                                        listViewDisplayed='auto'
                                        value={this.state.userDetails.address}
                                        //ref={ref => (this.refAddress = ref)} 
                                        ref={this.myRef}
                                        onPress={(data, details = null) => {
                                            this.setState({ 
                                                address: data.description, 
                                                lattitude: details.geometry.location.lat, 
                                                longitude: details.geometry.location.lng, 
                                            })
                                        }}
                                        query={{
                                            key: googleApiKey,
                                            language: 'en',
                                        }}
                                    />
                                </View>
                                {this.state.isAddressError && (
                                    <Text style={style.errorMsg}>
                                        This field is required
                                    </Text>
                                )}

                                {this.state.isApiError && (
                                    <Text style={style.errorMsg}>
                                        {this.state.apiMessage}
                                    </Text>
                                )}

                                <View style={[style.mT4,style.pB5]}>
                                    <TouchableOpacity style={style.themebtn} onPress={() => this._updateProfile()}>
                                        <Text style={style.btntext}>Save</Text>
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

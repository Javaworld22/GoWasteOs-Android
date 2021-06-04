import React, { Component } from 'react'
import { Text, View, SafeAreaView, ScrollView, Image, StatusBar, TouchableOpacity} from 'react-native';
import Swiper from 'react-native-swiper';
import style from '../../components/mainstyle';
import styles from './style';

export default class Welcome extends Component {

    render() {
        return (
            <SafeAreaView style={styles.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff"  />         
                <ScrollView style={{flex:1}}>  
                    <View style={styles.container}>
                        <View style={styles.sliderwrap}>
                            <Swiper style={styles.slider} showsButtons={false} loop={false} paginationStyle={styles.btr}
                            dot={<View style={{ backgroundColor: '#c8c8d8', width:10, height: 10, borderRadius: 100, marginLeft: 2, marginRight:2 }}/>}
                            activeDot={<View style={{ backgroundColor: '#1cae81', width:10, height: 10, borderRadius: 100, marginLeft: 2, marginRight:2 }} />}>
                                <View style={styles.slide1}>
                                    <Image source={require('../../assets/images/welcome-001.jpg')} style={styles.slideimg}></Image>
                                    <Text style={styles.slideheading}>Welcome</Text>
                                    <Text style={styles.slidetext}>Welcome to the GowasteOS services. The platform that connects you to your liquid waste service providers.</Text>
                                </View>
                                <View style={styles.slide1}>
                                    <Image source={require('../../assets/images/welcome-002.jpg')} style={styles.slideimg}></Image>
                                    {/* <Text style={styles.slideheading}>Welcome</Text> */}
                                    <Text style={styles.slidetext}>Find service providers closer to you and quickly, make your service request at the touch of a button.</Text>
                                </View>
                                <View style={styles.slide1}>
                                    <Image source={require('../../assets/images/welcome-003.jpg')} style={styles.slideimg}></Image>
                                    {/* <Text style={styles.slideheading}>Welcome</Text> */}
                                    <Text style={styles.slidetext}>Reach out now for your liquid waste evacuation.</Text>
                                </View>
                            </Swiper>
                        </View>

                        <View style={style.rowCenter}>
                            <TouchableOpacity style={styles.nextbtn} onPress={() => this.props.navigation.navigate('Login')}>
                                    <Image source={require('../../assets/images/next-btn.png')} style={styles.btnimg}></Image>
                            </TouchableOpacity>
                        </View>                        
                    </View>     
                    </ScrollView>              
            </SafeAreaView>           
        )
    }
}

import React, { Component } from 'react'
import { Text, View, SafeAreaView, TouchableOpacity, StatusBar, Image, ScrollView, Alert, FlatList } from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons';
import style from '../../components/mainstyle';
import styles from './style';
import Header from '../../components/Header/Header';
import {dynamicImageURL,endPoints, POST} from '../../components/Api';
import {Store, Retrieve, Remove} from '../../components/AsyncStorage';
import Loader from '../../components/Loader';
import { NavigationEvents } from 'react-navigation';

export default class jobList extends Component {
    constructor(props){
            super(props);  
            this.state = {
                jobList: {},
                showLoader: false,
                pageno: 1,
                isScroll:false,
              };   
    }
    componentDidMount = () => {
        this.getJob();            
    };

    deleteJob=(id)=>{
        Alert.alert(
            "",
            "Do you really want to delete this job?",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "OK", 
              onPress: () => this.deletejob(id)
            
            }
            ],
            { cancelable: false }
          );
    }

    deletejob=async(id)=>{
        this.setState({isScroll: false});
        this.setState({showLoader: true});
        let formData = new FormData();
        formData.append('customer_id', await Retrieve("userId"));
        formData.append('id', id);
            
        let response = await POST(endPoints.deleteJob, formData, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});
        if (response.ack == '1') {
            Alert.alert("", response.message, [
                { text: "Ok", onPress: () =>  this.getJob()}
            ]);

        } 
    }

    getJob=async()=>{
        let formDatas = new FormData();
        formDatas.append('customer_id', await Retrieve("userId"));
        if(this.state.isScroll==true){
            formDatas.append('pageno', this.state.pageno+1);
        }else{
            formDatas.append('pageno', this.state.pageno);
        }  
        

        if(this.state.isScroll == false){
            this.setState({ showLoader: true });
        }
        let responses = await POST(endPoints.myjoblist, formDatas, {
            Authorization: await Retrieve("userToken")
        });
        this.setState({showLoader: false});

        //for normal load
        if (responses.details.ack == '1' && this.state.isScroll==false) {
            this.setState({jobList: responses.details.jobs});
        } 
        //for delete
        if(this.state.isScroll==false && responses.details.ack == '0' && this.state.pageno==1){
            this.setState({jobList: {}});
        } 
        if(this.state.isScroll==false && responses.details.ack == '0' && this.state.pageno>1){
            let formData = new FormData();
            formData.append('customer_id', await Retrieve("userId"));
            formData.append('pageno', this.state.pageno-1);
            this.setState({showLoader: true});
            let response = await POST(endPoints.myjoblist, formData, {
                Authorization: await Retrieve("userToken")
            });
            this.setState({showLoader: false});
            if(response.details.ack == '1'){           
                const object2 = response.details.jobs;          
                this.setState({jobList: object2});
                this.setState({pageno: this.state.pageno-1});
            }

        } 
        //for scroll
        if(this.state.isScroll==true && responses.details.ack == '1'){
            const object1 = this.state.jobList;             
            const object2 = responses.details.jobs;             
            const object3 = [...object1, ...object2];         
            this.setState({jobList: object3});
            this.setState({isScroll: false});
            this.setState({pageno: this.state.pageno+1});
        } 
        this.setState({isScroll: false});
    }

    // isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    //     const paddingToBottom = 20;
    //     return layoutMeasurement.height + contentOffset.y >=
    //       contentSize.height - paddingToBottom;
    // };

    fetchList=()=>{
        this.setState({isScroll: true});
        this.getJob();
    }
    
      
    render() {
        return (
            <SafeAreaView style={style.wrapper}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                
                <Header 
                    {...this.props}
                    pageType="othersPage"
                    label="My Job List"
                />
                <Loader 
                    loading={this.state.showLoader} 
                />
                <NavigationEvents
                    onDidFocus={() => 
                        this.setState({pageno:1, isScroll:false},
                            ()=>{
                                this.getJob()
                            })
                    }
                />
                
                <View style={style.flatlistcontainer}>
                    <FlatList
                        data={Object.values(this.state.jobList)}
                        keyExtractor={item => item.id.toString()}
                        onEndReached={this.fetchList}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={ () => {return (
                            <Text>No job available</Text>
                        )}}
                        renderItem={({item}) => (

                            <TouchableOpacity 
                                style={style.card} 
                                onPress={() => this.props.navigation.navigate('JobDetails',{jobId: item.id})}
                            >
                                <View style={style.cardbody}>
                                    <View style={[style.rowSec, styles.width75]}>                                         
                                    <View style={style.cardthumb}>
                                        <Image source={{ uri: item.service.image }} style={{ width: 55, height: 55 }} />
                                    </View>
                                    <View style={styles.carddesc}>
                                    <Text style={styles.sheading}>{item.service.title}</Text>
                                        <View style={styles.rowbetween}>
                                            <View style={styles.prwrap}>
                                                <Text style={styles.plabel}>{new Date(item.date.split('T')[0]).toDateString()}</Text>
                                                <Text style={styles.mutetext}>{item.garbage_size+' '+item.service.unit}</Text>
                                            </View>                                                
                                        </View>          
                                    </View>
                                    </View>
                                    <TouchableOpacity style={style.smbtn}  onPress={() => {this.deleteJob(item.id)}} >
                                        <Text style={style.smbtntext}>delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                            
                </View>

                    
            </SafeAreaView>
            
        )
    }
}

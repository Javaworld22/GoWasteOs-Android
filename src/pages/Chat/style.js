export default {
  chatbox: {
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      borderBottomWidth:1,
      borderBottomColor:'#eee',
      paddingTop:10,
      paddingBottom:15,
      marginBottom:15
  },
  datetext: {
    fontSize:10,
    color:'#888',     
    fontFamily:'Montserrat-Regular',          
  },
  centercontent: {
    width:'75%',
    justifySelf:'flex-start',
    paddingRight:15
  },
  receivebox: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingTop:10,
    paddingBottom:10,
  },
  receivecontent: {
    width:'85%',
    paddingRight:15,
    alignItems: 'flex-start',
    textAlign: 'Left',
  },
  sendbox: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingTop:10,
    paddingBottom:10,
  },
  sendcontent: {
    width:'85%',
    paddingLeft:15,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  senderName : {
    color:'#000000',
    fontFamily:'Montserrat-Regular',
    fontSize:17,
    fontWeight:'bold',
    lineHeight:22,
    marginBottom:4,
  },
  bottomSendBox:{
    flexDirection:'row',
    backgroundColor:'white',
    height:50,
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 0
  },
  chatinputBox: {
    width:'85%',
    paddingLeft:5,
    paddingTop:5
  },
  senderavtimg: {
    width:"100%",
    height:"100%",
    // borderRadius:20
  },
  unreadmsgcount:{
    backgroundColor:'red',
    textAlign:'center',
    color:'white',
    padding:2,
    borderRadius:20,
    width:25,
  },



}
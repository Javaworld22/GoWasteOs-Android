import axios from 'axios';

export const baseURL = 'https://www.gowasteos.com/api/';
export const dynamicImageURL = 'https://www.gowasteos.com';
export const webClientId = '680624373132-k3ofeg0q9de8pgiqll26i953t3okrhld.apps.googleusercontent.com';
export const senderIdFirebase = "680624373132";
export const payStackPublickey = "pk_live_f352fcfa4020e80109d9eb39e9723eb1ffbd4484";
export const SOCKETSERVER = "http://54.167.156.255:8044/";
export const googleApiKey = 'AIzaSyDQmOfO0DzoFsx7Vx5UV_mAusRPBwCIDjg';

export const endPoints = {

  logIn: 'users/token.json',
  socialLogin: 'users/socialLogin.json',
  signUp: 'users/register.json',
  getPaystackBankList: 'users/getPaystackBankList.json',
  profileDetails: 'jobs/userprofiledetails.json',
  changePassword: 'users/changepassword.json',
  updateProfile: 'users/updateuserprofile.json',

  joblist: 'jobs/joblist.json',
  serviceProviderList: 'jobs/nearbyusers.json',

  citylist: 'services/citylist.json',
  cityServiceList: 'services/cityServiceList.json',
  servicePriceList: 'services/servicePriceList.json',

  jobpost: 'bookings/jobpost.json',
  myjoblist: 'jobs/myjoblist.json',
  jobdetails: 'bookings/jobdetails.json',
  jobEdit: 'jobs/jobEdit.json',

  bidHistory: 'jobs/bidHistory.json',
  bidPost: 'bookings/addBid.json',
  sendConfirmation: 'bookings/sendConfirmation.json',

  confirmationList: 'jobs/confirmationList.json',
  confirmationDetails: 'services/confirmationDetails.json',

  rejectConfirmationRequest: 'bookings/rejectConfirmationRequest.json',
  acceptConfirmationRequest: 'bookings/acceptConfirmationRequest.json',

  bookinglist: 'jobs/bookinglist.json',
  confirmBooking: 'bookings/confirmBooking.json',
  bookingDetails: 'bookings/bookingDetails.json',
  manualBooking: 'bookings/manualBooking.json',
  bookingCancel: 'jobs/bookingCancel.json',
  bookingDelete: 'jobs/bookingDelete.json',
  bookingEdit: 'bookings/updateBooking.json',

  deleteJob: 'jobs/jobDelete.json',
  notificationList: 'jobs/notificationList.json',
  updateNotiReadStatus: 'reviews/updateNotiReadStatus.json',

  forgotPassword: 'users/forgotpassword.json',
  resetPassword: 'users/setpassword.json', 
  addReview: 'reviews/addReview.json', 

  messages: 'messages/getMessages.json', 
  messagesGroups: 'messages/getMessageGroups.json', 
  sendMessages: 'messages/addMessages.json',
  updateMsgReadStatus: 'messages/updateReadStatus.json',

  nearByMapUsers: 'users/nearByMapUsers.json',
   
  addTracking: 'trackers/add.json', 
  updateTracking: 'trackers/update.json', 
  fetchTracking: 'trackers/fetch.json', 

  addTransactionDetails: 'payments/insertTransaction.json', 
  insertProviderTransaction: 'payments/insertProviderTransaction.json', 

  fetchSettings: 'services/fetchSettings.json', 
};

export const POST = async (endPoint, params, header) => {
  try {
    var response = await axios({
      method: 'post',
      url: baseURL + endPoint,
      data: params,
      headers: header && header,
    });
    //var returnObj = JSON.parse(JSON.stringify(response.data));
    // console.log('response in api ==>', response);

    return response.data;
    // return response;
  } catch (e) {
    var returnObj = {
      msg: e,
      ack: -1,
    };
    // console.log('catch ==> ', returnObj);
    return returnObj;
  }
};

export const GET = async (endPoint, header) => {
  try {
    var response = await axios({
      method: 'get',
      url: baseURL + endPoint,
      headers: header && header,
    });
    // console.log('response in api ==>', response);
    return response.data;
  } catch (e) {
    var returnObj = {
      msg: e,
      ack: -1,
    };
    // console.log('catch ==> ', returnObj);
    return returnObj;
  }
};

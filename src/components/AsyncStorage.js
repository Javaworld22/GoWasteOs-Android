import AsyncStorage from '@react-native-community/async-storage';

export const Store = async (key, value) => {
  try {
    
    var storeRes = await AsyncStorage.setItem(key, JSON.stringify(value));
    return storeRes;
  } catch (error) {
    console.log(error.message);
  }
};

export const Retrieve = async key => {
  try {
    const retrievedItem = await AsyncStorage.getItem(key);
    const item = JSON.parse(retrievedItem);
    return item;
  } catch (error) {
    console.log(error.message);
  }
};

export const Remove = async key => {
  await AsyncStorage.removeItem(key);
};

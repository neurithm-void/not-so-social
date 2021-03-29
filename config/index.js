"use strict";

const path = require('path');

 /**
  * Configures the application based on the NODE_ENV eg: "production, qa and development"
  * return application configurations   
  */
 
 const loadConfig = () => {
     switch (process.env.NODE_ENV) {
    //  case "production":
    //      return { };
    //  case "development":
    //      return {
    //          app_id = process.env.APP_ID,
    //          facebook_oath_url = process.env.FB_OATH_URL,
    //          redirect_url = process.env.REDIRECT_URL
    //                 };
     default:
         return {
             app_id : process.env.APP_ID,
             hash_secret : process.env.HASH_SECRET || "SuNfLoWeR",
             redirect_url : process.env.REDIRECT_URL || "https://www.facebook.com/connect/login_success.html",
             local_store_path: path.join(__dirname, process.env.LOCAL_STORE_PATH),
             default_data_path : path.join(__dirname, process.env.DEFAULT_DATA_PATH || "../data/default-data.json"),
             user_preference_path : path.join(__dirname, process.env.USER_PREFERENCE_PATH || "../data/user-preference-data.json")
            }
     }
 };
 
 module.exports = loadConfig;
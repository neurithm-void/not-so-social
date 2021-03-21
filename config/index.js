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
             local_store_path: path.join(__dirname, process.env.LOCAL_STORE_PATH || "../data/user-data.json"),
             default_data :{
                user_id : null,
                name : null,
                profile_photo_url : null,
                login_status: "out"
             }
            }
     }
 };
 
 module.exports = loadConfig;
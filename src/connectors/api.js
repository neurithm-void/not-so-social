"use strict";

const axios = require('axios');
const config = require("../../config")();


// const getApiRequest = async(url) =>{

//     console.log("requesting....")
//     try{
//         let response = await axios.get(url);
//         console.log(response);
//         return response
//     }
//     catch (err){
//         throw err;
//     }
// }


const fbLoginUrl = (scopes, redirect_uri = 'https://www.facebook.com/connect/login_success.html')=>{

	let url = `https://www.facebook.com/v10.0/dialog/oauth?client_id=${config.app_id}&redirect_uri=${redirect_uri}&response_type=token,granted_scopes&scope=${scopes}&display=popup`;
    return url
}


// const fbGraphApi = (endpoint, fields, access_token)=>{

//     fields = fields.join(","); //connecting all fields in array to comma sep string

//     const url = "https://graph.facebook.com/v10.0/" + endpoint;
//     const finalUrl = url + `?fields=${fields}` + `?access_token=${access_token}`;

//     return finalUrl;
// }



module.exports = { fbLoginUrl};
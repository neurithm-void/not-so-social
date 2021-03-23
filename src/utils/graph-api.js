//all the graph api related calls. 

"use strict";

const FB = require("fb");
const LocalStore = require("../connectors/local-datastore");


// let datastore = new LocalStore();

// //setting accesstoken for the graph call
// FB.setAccessToken(datastore.get("access_token"));

/**
 * update the local store with account information. 
 */
const getIGAccountDetails = (IG_ID, page_id, FB, datastore)=>{
    
    // let IG_ID = dataStore.getFromObject("fb_to_ig_mapping")[`${page_id}`];

    FB.api(`/${IG_ID}`,
        {fields: ["name", "username", "followers_count", "follows_count", "biography"]},
        (res) =>{
            // let ig_info = {
            //     "name": res.name,
            //     "username": res.username,
            //     "followers_count": res.followers_count,
            //     "follows_count": res.follows_count,
            //     "biography": res.biography,
            //   };
            // console.log({...res, page_id});

            datastore.setCollection("ig_info_by_page", {...res, page_id})

        })
}



module.exports = { getIGAccountDetails }
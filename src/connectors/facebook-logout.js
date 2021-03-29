
const FB = require("fb");
const config = require("../../config")();


const logoutOfFacebook = async (datastore)=>{

    try{
        let access_token = datastore.get("access_token");
        FB.setAccessToken(access_token);
    
        await FB.logout();
    
        //remove all the user data
        datastore.removeData();

        return true;
    }
    catch(err){
        console.log(err);

        return false;
    }

}



module.exports = {logoutOfFacebook};
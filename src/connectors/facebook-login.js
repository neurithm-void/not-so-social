"use strict";

const FB = require("fb");
const config = require("../../config")();
const {app, BrowserWindow, session} = require("electron");
const { fbLoginUrl } = require("./api");


const loginToFacebook = ( mainWindow, loadingWindow, datastore )=>{
    
    //permission need to ask while logging into facebook
    let scopes = ["email", "pages_show_list", "instagram_basic", "instagram_content_publish", "instagram_manage_comments", "instagram_manage_insights"];

    let loginUrl = fbLoginUrl(scopes, config.redirect_url);

    let facebookLoginWindow = new BrowserWindow({
		width: 450,
		height: 300,
		show: false,
		parent: loadingWindow,
		modal: true,
		webPreferences: {
			nodeIntegration: false
		}
	});

    facebookLoginWindow.loadURL(loginUrl);
    
    facebookLoginWindow.webContents.on("did-finish-load", ()=>{
        facebookLoginWindow.show();
    })

    //once user logged in, website will automatically redirect, hence capture url in the redirect
	// facebookLoginWindow.webContents.on('will-navigate', (event, url) => extractAccessToken(url, datastore));

    let filter = {urls: [ config.redirect_url+ '*']};

    //close facebook login window once session is completed
    session.defaultSession.webRequest.onCompleted(filter, async(details) => {
		let url = details.url;
		facebookLoginWindow.close();
        await extractAccessToken(url, datastore)
	});

    //make graph api call for all account details
    facebookLoginWindow.on("closed", async(details)=>{
        //now close the loading window
        loadingWindow.close();
        mainWindow.show(); //show main window
    })

}


const extractAccessToken = async(url, datastore)=>{
    
    let raw_code = /access_token=([^&]*)/.exec(url) || null;
    let access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    let error = /\?error=(.+)$/.exec(url);   
    
    datastore.set("access_token", access_token);
    
    //update facebook details to the DB
    await updateFacebookDetails(access_token, datastore);
}


const updateFacebookDetails = async(access_token, datastore)=>{

    FB.setAccessToken(access_token);
	
    let response = await FB.api('/me', {fields: ['id', 'name', 'picture.width(800).height(800)', "accounts"]});

    let today = new Date();

    //update respone to the datastore
    datastore.set("login_details", {
        name: response.name,
        email: response.email,
        user_id: response.id,
        last_login: today.toDateString()
    })

    datastore.set("user_preferences", {
        profile_photo_url: response.picture.data.url
    })

    //add page id 
    //add page related data to datastore
    response.accounts.data.forEach((page, idx )=> ({...page, fb_page_node_id: idx}));

    // let pages = Object.assign({}, response.accounts.data);  //creating a copy
    datastore.set("connected_fb_pages", response.accounts.data);

    //make async call to the collect instagram information.
    updateLinkedInstagramId(datastore);
}


const updateLinkedInstagramId = async(datastore)=>{

    let pages = datastore.get("connected_fb_pages")
    pages.forEach((page, idx) => {

        FB.api(`/${page.id}`,
        {fields: ["instagram_business_account"]},
        (res) =>{
            
            let IG_ID = res.instagram_business_account.id;
            datastore.addEntryInObject("fb_page_to_ig_mapping", idx, IG_ID);

        })

    })
    
}


module.exports = {loginToFacebook, updateFacebookDetails};
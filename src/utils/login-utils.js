"use strict";

const FB = require("fb");
const config = require("../../config")();
const {app, BrowserWindow, session} = require("electron");
const LocalStore = require("../connectors/local-datastore");


// useful scopes
// instagram_basic
// instagram_content_publish
// instagram_manage_comments
// instagram_manage_insights

const facebookAuth = (mainWindow, loadingWindow) =>{
    
    const datastore = new LocalStore();

    let options = {
		client_id: config.app_id,
		scopes: 'email,instagram_basic,pages_show_list',
		redirect_uri: 'https://www.facebook.com/connect/login_success.html'
	};

	let fbAuthWindow = new BrowserWindow({
		width: 450,
		height: 300,
		show: false,
		parent: mainWindow,
		modal: true,
		webPreferences: {
			nodeIntegration: false
		}
	});

	let facebookAuthURL = `https://www.facebook.com/v10.0/dialog/oauth?client_id=${options.client_id}&redirect_uri=${options.redirect_uri}&response_type=token,granted_scopes&scope=${options.scopes}&display=popup`;


	fbAuthWindow.loadURL(facebookAuthURL);
	fbAuthWindow.webContents.on('did-finish-load',  () => {
        // loadingWindow.close();
		fbAuthWindow.show();
	});

    let closedByUser = true; //flag to track if login window is closed by the user
    let access_token, error;

    const handleUrl = (url)=>{

        let raw_code = /access_token=([^&]*)/.exec(url) || null;
		access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
		error = /\?error=(.+)$/.exec(url);

		if (access_token || error) {
			closedByUser = false;
			FB.setAccessToken(access_token);
			FB.api('/me', 
				{fields: ['id', 'name', 'picture.width(800).height(800)', "accounts"]},  
				(res) => {
					console.log(res.accounts)
					
					datastore.set("name", res.name);
					datastore.set("user_id", res.id);
					datastore.set("profile_photo_url", res.picture.data.url);
					datastore.set("login_status", "in");

					let today = new Date();
					datastore.set("last_loggin", today.toDateString())

				});
            mainWindow.show();
		}
    }
    //capture url once the page navigate to the redirect url
	// fbAuthWindow.webContents.on('will-redirect', (event, url) => handleUrl(url));
	fbAuthWindow.webContents.on('will-navigate', (event, url) => handleUrl(url));
	let filter = {
		urls: [options.redirect_uri + '*']
	};
	session.defaultSession.webRequest.onCompleted(filter, (details) => {
		let url = details.url;
		loadingWindow.close();
		handleUrl(url);
		fbAuthWindow.close();
	});

    //TODO: need to find better way to do this
	// fbAuthWindow.on('close', () => event.returnValue = closedByUser ? { error: 'The popup window was closed' } : { access_token, error })

}



module.exports = facebookAuth;
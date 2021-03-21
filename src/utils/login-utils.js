"use strict";

const FB = require("fb");
const config = require("../../config")();
const {app, BrowserWindow} = require("electron");
const LocalStore = require("../connectors/local-datastore");



const facebookAuth = (mainWindow, loadingWindow) =>{
    
    const datastore = new LocalStore();

    let options = {
		client_id: config.app_id,
		scopes: 'email',
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
        loadingWindow.close();
		fbAuthWindow.show();
	});

    let closedByUser = true; //flag to track if login window is closed by the user
    let access_token, error;

    const handleUrl = (url)=>{

        loadingWindow.close();

        let raw_code = /access_token=([^&]*)/.exec(url) || null;
		access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
		error = /\?error=(.+)$/.exec(url);

		if (access_token || error) {
			closedByUser = false;
			FB.setAccessToken(access_token);
			FB.api('/me', {
				fields: ['id', 'name', 'picture.width(800).height(800)']
			}, function (res) {

				datastore.set("name", res.name);
				datastore.set("user_id", res.id);
				datastore.set("profile_photo_url", res.picture.data.url);
				datastore.set("login_status", "in");
                let today = new Date();
                datastore.set("last_loggin", today.toDateString())

			});
			fbAuthWindow.close();
            mainWindow.show();
		}
    }
    //capture url once the page navigate to the redirect url
	fbAuthWindow.webContents.on('will-redirect', (event, url) => handleUrl(url));

    //TODO: need to find better way to do this
	// fbAuthWindow.on('close', () => event.returnValue = closedByUser ? { error: 'The popup window was closed' } : { access_token, error })

}



module.exports = facebookAuth;
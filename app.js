"use strict";

const path = require('path');
const {app, BrowserWindow, ipcMain} = require("electron");
const LocalStore = require("./src/connectors/local-datastore");
const {loginToFacebook, updateFacebookDetails} = require("./src/connectors/facebook-login");
const config = require("./config")();
const { dateDiffInDays } = require("./src/utils/utils");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let appWindow; 
let datastore = new LocalStore(config.local_store_path);


const createWindow = async()=>{

    appWindow = new BrowserWindow({
                        show: false,
                        webPreferences :{
                          nodeIntegration: false, // is default value after Electron v5
                          contextIsolation: true, // protect against prototype pollution
                          enableRemoteModule: false, // turn off remote
                          preload : path.join(__dirname, "preload.js") // use preloaded js script
                        }
                      })

    //load index.html in app window
    appWindow.loadFile(path.join(__dirname, 'index.html'))

    let loadingWindow = new BrowserWindow({width: 600, height: 300, parent: appWindow, frame: false});
    loadingWindow.loadFile(path.join(__dirname, "resources/html/loading.html"));

    // Open the DevTools.
    let loginDetails = datastore.get("login_details");
    let lastLoggedInDate = new Date(loginDetails["last_login"]);
    let today = new Date();

    if (dateDiffInDays(lastLoggedInDate, today) > 1){  //relogin prompt if last log in was 1 day back
        loginToFacebook(appWindow, loadingWindow, datastore);
    }
    else{
        try{
            await updateFacebookDetails(datastore.get("access_token"), datastore);

            setTimeout(()=>{
                loadingWindow.close();
                appWindow.show();
              }, 3000); //adding delay of 3 sec to make it look more natural
        }
        catch(err){
            loginToFacebook(appWindow, loadingWindow, datastore);
        }

    }

}


app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (appWindow === null) {
		createWindow()
	}
})


ipcMain.on("toMain", (event, args) => {

  let responseObj;

  if(args.task === "get_user_data"){

    let login_details = datastore.get("login_details");
    let user_preferences = datastore.get("user_preferences");

    responseObj = {
      task : "get_user_data",
      data : {
        user_name : login_details.name,
        email : login_details.email,
        profile_picture_url : user_preferences.profile_photo_url,
        pages : datastore.get("connected_fb_pages")
      }
    }

  }
  else if (args.task === "get_page_data_by_idx"){
      //TODO: return given page related information specified by id.
      
      responseObj = {
        task : "get_page_data_by_idx",
        data : {}  //datastore.getCollection("ig_bussiness_account")[parseInt(args.id)]
      }
  }
  
  //send result back to renderer
  appWindow.webContents.send("fromMain", responseObj);

});
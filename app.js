"use strict";

const path = require('path');
const {app, BrowserWindow, ipcMain} = require("electron");
const LocalStore = require("./src/connectors/local-datastore");
const {loginToFacebook, updateFacebookDetails} = require("./src/connectors/facebook-login");
const {logoutOfFacebook} = require("./src/connectors/facebook-logout");
const config = require("./config")();
const { dateDiffInDays } = require("./src/utils/utils");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let appWindow; 
let loadingWindow;
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

    
    loadingWindow = new BrowserWindow({width: 600, height: 300, parent: appWindow, frame: false});
    loadingWindow.loadFile(path.join(__dirname, "resources/html/loading.html"));

    //if datastore is empty, login again. 
    if(datastore.isEmpty()){
      loginToFacebook(appWindow, loadingWindow, datastore);
    }else{
      //check the date diff, it is more than 1 day, relogin again.
      let loginDetails = datastore.get("login_details");
      let lastLoggedInDate = new Date(loginDetails["last_login"]);
      let today = new Date();
  
      if (dateDiffInDays(lastLoggedInDate, today) > 1){  //relogin prompt if last log in was 1 day back
          loginToFacebook(appWindow, loadingWindow, datastore);
      }
      else{
        //no need to login, 
        try{
            await updateFacebookDetails(datastore.get("access_token"), datastore);

            setTimeout(()=>{
                loadingWindow.close();
                appWindow.show();
              }, 3000); //adding delay of 3 sec to make it look more natural
        }
        catch(err){
            console.log(err);
            loginToFacebook(appWindow, loadingWindow, datastore);
        }
      }
    }
    
    //load index.html in app window
    appWindow.loadFile(path.join(__dirname, 'index.html'))


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


const getUserDetails =()=>{

    let login_details = datastore.get("login_details");
    let user_preferences = datastore.get("user_preferences");

    let responseObj = {
      task : "get_user_data",
      data : {
        user_name : login_details.name,
        email : login_details.email,
        profile_picture_url : user_preferences.profile_photo_url,
        pages : datastore.get("connected_fb_pages")
      }
    }

    return responseObj;
}


ipcMain.on("toMain", (event, args) => {

  let responseObj;

  if(args.task === "get_user_data"){
    responseObj = getUserDetails();
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


ipcMain.on("login", (event, args)=>{
    loginToFacebook(appWindow, loadingWindow, datastore);
    let responseObj = getUserDetails();
    appWindow.webContents.send("fromMain", responseObj);
});


ipcMain.on("logout", async(event, args)=>{
    console.log("logging out");

    let res = await logoutOfFacebook(datastore);

    if(res){
      appWindow.webContents.send("logout", res);
    }
    else{
      appWindow.webContents.send("logout", res);
    }
})
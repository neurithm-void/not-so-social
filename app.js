"use strict";

const path = require('path');
const {app, BrowserWindow, ipcMain} = require("electron");
const facebookAuth = require("./src/utils/login-utils");
const LocalStore = require("./src/connectors/local-datastore");


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let appWindow; 
let datastore = new LocalStore();

const createWindow = ()=>{

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
    // appWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    appWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      appWindow = null
    })

    if(datastore.get("login_status") === "out"){
      facebookAuth(appWindow, loadingWindow);
    }
    // else if(false){ //TODO: if last log in time is more than 2 days. 
    //   facebookAuth(appWindow, loadingWindow);
    // }
    else{
      setTimeout(()=>{
        loadingWindow.close();
        appWindow.show();
      }, 3000); //adding delay of 3 sec to make it look more natural
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

//data-main = "libs/main"

// ipcMain.on("fb-authenticate", (event, arg) => facebookAuth(event, arg, appWindow));

ipcMain.on("toMain", (event, args) => {

  let responseObj;

  if(args === "get_user_data"){
    responseObj = {
      user_name : datastore.get("name"),
      profile_picture_url : datastore.get("profile_photo_url")
    }
  }
  
  //send result back to renderer
  appWindow.webContents.send("fromMain", responseObj);

});
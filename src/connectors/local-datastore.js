"use strict";


const fs = require('fs');
const config = require("../../config")();
const {Encryption} = require("../utils/utils")



class LocalStore {
  constructor() {
    
    this.encryption = new Encryption();
    this.path = config.local_store_path;
    this.data = parseDataFile(this.path, config.default_data);

    this.encryptionExcludeKeys = ["login_status", "profile_photo_url"]
  }
  
  // This will just return the property on the `data` object
  get(key) {
    return this.encryptionExcludeKeys.includes(key) ? this.data[key] : this.encryption.decrypt(this.data[key]); 
  }
  
  //add data to local datastore with key and value
  set(key, val) {
    this.data[key] = this.encryptionExcludeKeys.includes(key) ? val : this.encryption.encrypt(val);
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}


function parseDataFile(filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}



module.exports = LocalStore;
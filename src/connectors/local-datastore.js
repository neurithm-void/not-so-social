"use strict";


const fs = require('fs');
const config = require("../../config")();
const {Encryption} = require("../utils/utils")



class LocalStore {
  constructor() {
    
    this.encryption = new Encryption();
    this.path = config.local_store_path;
    this.data = parseDataFile(this.path, config.default_data);

    this.encryptionExcludeKeys = ["login_status", "profile_photo_url", "tasks", "pages", "followers_count", "follows_count", "page_id"]
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


  //This will return an Object from the database.
  getCollection(key){
    let cacheObject = this.data[key];

    //check if it is an array,
    if(Array.isArray(cacheObject)){
        let cacheArray = [];

        cacheObject.forEach(obj => {
          Object.keys(obj).forEach(obKey => obj[obKey] = this.encryptionExcludeKeys.includes(obKey) ? obj[obKey] : this.encryption.decrypt(obj[obKey]));
          cacheArray.push(obj);
        })

        return cacheArray;
    }
    // else if (typeof cacheObject === 'object'){  //check if it an object

    //   Object.keys(cacheObject).forEach(obKey => cacheObject[obKey] = this.encryptionExcludeKeys.includes(obKey) ? cacheObject[obKey] : this.encryption.decrypt(cacheObject[obKey]));
    //   return cacheObject;
    // }
    else{
      //assume it as a single value
      return this.encryptionExcludeKeys.includes(key) ? cacheObject : this.encryption.decrypt(cacheObject); 
    }
  }


  //This will dump an Object to database.
  setCollection(key, val){

    //check if the val is an Object, else store it using set. 
    if (typeof val !== 'object'){
      this.set(key, val);
    }
    else{
      //encrypting vals of required keys. 
      // TODO: careate seprate function for this.
      // Object.keys(val).forEach(obKey => {
      //   val[obKey] = this.encryptionExcludeKeys.includes(obKey) ? val[obKey] : this.encryption.encrypt(val[obKey])
      //   console.log(val);
      // });

      Object.keys(val).forEach(obKey => val[obKey] = this.encryptionExcludeKeys.includes(obKey) ? val[obKey] : this.encryption.encrypt(val[obKey]));

      
      if(this.data[key]){ //if key already exists in the database
        this.data[key].push(val)
      }
      else{
        this.data[key] = [val];
      }

      fs.writeFileSync(this.path, JSON.stringify(this.data));

    }
  }

  //this will add key, val pair to the given dictionary.
  addToObject(objKey, key, val){
    //check if object exists
    if (this.data[objKey]){
      this.data[objKey][key] = this.encryptionExcludeKeys.includes(key) ? val : this.encryption.encrypt(val);
    }
    else{
      this.data[objKey] = {[key] : this.encryptionExcludeKeys.includes(key) ? val : this.encryption.encrypt(val)};
    }

    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  getFromObject(objKey, key){
    //check if object exists
    if (this.data[objKey]){
      return this.encryptionExcludeKeys.includes(key) ? this.data[objKey][key] : this.encryption.decrypt(this.data[objKey][key]);
    }
    else{
      console.log("Object do not exists")
    }
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
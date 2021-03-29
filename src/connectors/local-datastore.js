"use strict";


const fs = require('fs');
const {Encryption} = require("../utils/utils")
const config = require("../../config")();

class LocalStore{
    
    constructor(data_path){
        this.encryption = new Encryption();
        this.path = data_path;
        this.data = parseDataFile(this.path);

        this.encryptedKeys = ["user_id", "access_token", "id", "name", "username", "email"]  //update list as more secret keys need to be encrypted
    }
    
    //get value of the key which can be anything, e.g. string, array, dictionary
    //will only work with first order keys.
    get(key){

        let value = this.data[key];
        
        //creating a deep copy. 
        if(typeof value == "object"){
            value = JSON.parse(JSON.stringify(value));
        }

        if(typeof value == "object" && Array.isArray(value)){
            // TODO: add support for list of list if needed
            value.map((val)=>{
                return typeof val == "object" ? this.decryptObject(val) : val;
            })

            return value
        }
        else if(typeof value == "object" && value !== null){
            //check all the keys and decrypt the values
            this.decryptObject(value);

            return value
        }
        else{
            return this.encryptedKeys.includes(key) ? this.encryption.decrypt(value) : value; 
        }
    }


    //set value of the given key(first order key), value can only be e.g. string, array, object
    //if key already exists, it will create an array with previous value and current
    set(key, value, overwrite=true){

        value = this.encryptValue(key, value);

        //if key already exists in the database, create a array and push the value.
        if(this.data[key] && !overwrite){ 
            if (Array.isArray(this.data[key])){
                this.data[key].push(value)
            }
            else{
                this.data[key] = [this.data[key], value]
            }
        }
        else{
            this.data[key] = value;
        }

        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    //remove key from the data, (only works with the primary key)
    remove(key){

        delete this.data[key];
        fs.writeFileSync(this.path, JSON.stringify(this.data));

    }

    removeData(){
        this.data = {};
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }


    isEmpty(){
        /**
         * Return true if the datastore is empty, else false. 
         * empty dataset defination is ->
         * 1. either of access_token or login_details are empty.
         * here, only access_token is considered
         */

        if(!this.data["access_token"]){
            return true;
        }
        else{
            return false;
        }
    }

    //add key-value to the object of given key 
    addEntryInObject(ObjKey, key, value){

        let mainObject = this.data[ObjKey];

        // if (!mainObject){ //main object is null, create 

        // }
        if((typeof mainObject == "object" && !Array.isArray(mainObject)) || (!mainObject)){
            
            value = this.encryptValue(key, value);
            this.data[ObjKey] = {...mainObject, [key] : value};

        }   
        else{
            throw `can only add entry to the object, typeof ${ObjKey} is ${typeof mainObject}`; //TODO: need to update it for array
        }

        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }


    //encrypt given value
    encryptValue(key, value){

        if(typeof value == "object" && Array.isArray(value)){
            // TODO: add support for list of list if needed
            value.map((val)=>{
                return typeof val == "object" ? this.encryptObject(val) : val;
            })
        }
        else if(typeof value == "object" && value !== null){
            //check all the keys and decrypt the values
            this.encryptObject(value);
        }
        else{
            //check if its
            value = this.encryptedKeys.includes(key) ? this.encryption.encrypt(value) : value; 
        }

        return value
    }

    //decrypt value of specified keys in object
    decryptObject(obj){
        //creating a deep copy in case of dictionary. 
        // let obj = {...oldObj}

        Object.keys(obj).forEach(obKey => obj[obKey] = this.encryptedKeys.includes(obKey) ? this.encryption.decrypt(obj[obKey]) : obj[obKey]);
        
        // console.log("äsdafasf")
        // console.log(oldObj, obj)
    }
    
    // encryptNestedObject(obj){
    //     //encrypt multiple/nested objects and array. 

    //     if(Array.isArray(obj)){
    //         // TODO: add support for list of list if needed
    //         obj.map((val)=>{
    //             return typeof val == "object" ? this.encryptObject(val) : val;
    //         })
    //     }
    //     else if(obj !== null){
    //         //check all the keys and decrypt the values
    //         this.encryptObject(obj);
    //     }
    // }

    //encrypt the value of specified keys in object
    encryptObject(obj){
        Object.keys(obj).forEach(obKey => obj[obKey] = this.encryptedKeys.includes(obKey) ? this.encryption.encrypt(obj[obKey]) : obj[obKey]);
        
    }
}




const parseDataFile = (filePath) => {
    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
    try {
      return JSON.parse(fs.readFileSync(filePath));
    } catch(error) {
      console.log(error);
      return JSON.parse(fs.readFileSync(config.default_data_path));
    }
}

  
  
module.exports = LocalStore;
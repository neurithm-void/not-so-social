"use strict";

//TODO: convert this to chai and mocha test cases

const LocalStore = require("../src/connectors/local-datastore-v2");
const config = require("../config")();


let test_keys = ["test_object", "test_string", "test_array", "test_number"];

let test_data = {
    test_string : "test",
    test_array : ["test", "array", 1],
    test_object : {
        test : "obj"
    },
    test_number : 0
}

let datastore = new LocalStore(config.local_store_path);


// adding data to the localstore
test_keys.forEach(key =>{
    datastore.set(key, test_data[key]);
})



//adding entry in the object
datastore.addEntryInObject("test_object", "test2", "obj2");

//adding more value to the same key
datastore.set("test_object", {"obj" : "test"});



//printing datastore
console.log("datatore state after adding test data")
console.log(datastore.data);

//remove test data
test_keys.forEach(key => datastore.remove(key));

console.log("datatore state after removing test data")
console.log(datastore.data);





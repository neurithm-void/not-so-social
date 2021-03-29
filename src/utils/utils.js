"use strict";

const CryptoJS = require('crypto-js');
const config = require("../../config")();


class Encryption {

    encrypt = (text) => {
        return CryptoJS.AES.encrypt(text, config.hash_secret).toString();
      };
      
    decrypt = ciphertext => {

        const bytes = CryptoJS.AES.decrypt(ciphertext, config.hash_secret);
        // const originalText = bytes.toString(CryptoJS.enc.Utf8);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        return originalText;

      };
}


const dateDiffInDays = (date1, date2)=>{

  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  return diffDays;

}


module.exports = {Encryption, dateDiffInDays};
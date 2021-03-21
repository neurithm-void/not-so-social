"use strict";

const CryptoJS = require('crypto-js');
const config = require("../../config")();


class Encryption {

    encrypt = (text) => {
        return CryptoJS.AES.encrypt(text, config.hash_secret).toString();
      };
      
    decrypt = ciphertext => {

        const bytes = CryptoJS.AES.decrypt(ciphertext, config.hash_secret);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;

      };
}


module.exports = {Encryption};
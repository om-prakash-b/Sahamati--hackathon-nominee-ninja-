const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  pan: {
    type: String,
    required: true,
    unique: true,
    set: (value) => CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString(),
    get: (value) => CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
  },
  aadhaar: {
    type: String,
    required: true,
    unique: true,
    set: (value) => CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString(),
    get: (value) => CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8),
  },
  classXRollNo: {
    type: String,
    required: true,
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married'],
    required: true,
  },
  numberOfChildren: {
    type: Number,
    default: 0,
  },
  marriageCertificateNumber: {
    type: String,
  },
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', { getters: true, virtuals: true });

module.exports = mongoose.model('User', UserSchema);

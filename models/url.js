'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const URLSchema = new Schema({
  original_url: String,
  short_url: Number
});

const URL = mongoose.model('Url', URLSchema);

module.exports = URL;
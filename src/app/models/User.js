const db = require('../../config/db');

const Product = require('../models/Product');
const fs = require('fs');

const Base = require('./Base');

Base.init({table: 'users'})

module.exports = {
    ...Base,
}

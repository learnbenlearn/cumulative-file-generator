const express = require('express');

const { handlePost } = require('../controllers');

const router = express.Router();

router.post('/', handlePost);

module.exports = router;

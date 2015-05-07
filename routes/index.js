var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Hypnotoad' });
});

router.post('/login', function(req, res) {
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}
	var db = req.db;
	db.collection('users').find({
		username:req.body.username,
		password:req.body.password 
	}).toArray(function (err, items) {
		if(items.length > 0){
			return res.json(items[0]);
		}
		return res.status(404).end();
	});
});

module.exports = router;

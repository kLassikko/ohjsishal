var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var db = req.db;
	    db.collection('users').find().toArray(function (err, items) {
	        res.json(items);
	    });
});

router.post('/', function(req, res) {
    var db = req.db;
    db.collection('users').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: 'success' } : { msg: err }
        );
    });
});

router.param('id', function(req, res, next, id) {
	var ObjectID = require('mongoskin').ObjectID;
	var db = req.db;
	db.collection('users').find({_id: ObjectID(id)}).toArray(function (err, items) {
		req.user = items;
		next();
	});
});

router.get('/:id', function(req, res) {
	res.json(req.user);
});

router.put('/:id/remove', function(req, res) {
	var ObjectID = require('mongoskin').ObjectID;
	var db = req.db;
	db.collection('users').remove({_id: ObjectID(req.user[0]._id)}, function(err, result){
		res.send(
			(err === null) ? { msg: 'success' } : { msg: err }
		)
	});
});

module.exports = router;
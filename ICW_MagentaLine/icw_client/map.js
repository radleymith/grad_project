var mongoose = require('mongoose'),
	db = mongoose.connection,
	Buoy = require('../models/buoy'),
    BuoyPlus = require('../models/buoyPlus')
    Sounding = require('../models/sounding'),
    convert = require('../lib/converter'),
    queryHelper = require('../lib/queryHelper'),
    soundingDepth = 'WLDepth_ft',
    _ = require('lodash'),
    icwClient = require('../lib/icw_client'),
    qs = require('querystring'),
    config = {
        host:'http://localhost:',
        port: 8001,
        serviceName: '/icw-service'
    },
    http = require('http');

module.exports.getMarkers = function (bounds, request, callback) {
    var query = '/markers?' + qs.stringify(bounds),
        url = buildUrl(query);



    // var params = req.query,
    //     queryObj;



    // if (params) {
    //     queryObj = queryHelper.boxQuery(params.bottomLeft, params.upperRight);
    // } else {
    //     queryObj = {};
    // }

    // icwClient.getMarkers(queryObj)
    //     .then(function (response) {
    //         console.log('>>>>>>>>>>>>>>>>>>>>>>in the response')        
    //         res.json(response)
    //     },
    //     function (err) {
    //         console.log('>>>>>>>>>>>>>>>>>>>in the error')
    //     })
}

module.exports.getSoundings = function (req, res, next) {

    var params = req.query,
        queryObj;

    if (params) {
        queryObj = queryHelper.boxQuery(params.bounds.bottomLeft, params.bounds.upperRight);
    }

    Sounding.find(queryObj)
        .exec(function (err, data) {
            res.json(data)
        });
}

module.exports.getClassifiedMarkers = function (req, res, next) {
    var params = req.query,
        queryObj,
        MAX_DISTANCE = 5;

    if (params) {
        queryObj = queryHelper.boxQuery(params.bottomLeft, params.upperRight);
    } else {
        queryObj = {};
    }

    BuoyPlus.find(queryObj)
        .exec(function (err, data) {
            res.json(convert.depthClassification(data));
        });
}

module.exports.getDepthPointsForHeat = function (req, res, next) {

    var params = req.query,
        queryObj;

    if (params) {
        queryObj = queryHelper.boxQuery(params.bounds.bottomLeft, params.bounds.upperRight);
    }

    Sounding.find(queryObj)    
        .where(soundingDepth).lt(params.depth)
        .exec(function (err, data) {
            res.json(convert.heatmap(data, params.depth));
        });
}

function buildUrl (additonalUrl) {
    return config.host + config.port + config.serviceName + additionalUrl;
}
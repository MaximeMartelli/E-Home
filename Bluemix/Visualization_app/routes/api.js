/*******************************************************************************
* Copyright (c) 2014 IBM Corporation and other Contributors.
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
* IBM - Initial Contribution
* Maxime MARTELLI - follow up
*******************************************************************************/


var express = require('express');
var router = express.Router();

var util = require('../utils/util');

var pathSeperator ='/';
var base_path='/api/v0002';
var historian_path =  base_path + pathSeperator + 'historian';
var types_path = "types";
var devices_path = "devices";

// Connection à l'organisation
router.get('/organization', function(req, res) {

  var orgId = req.session.api_key.split('-')[1];
  console.log("Info for orgId "+orgId); 
  
  var uri= base_path;

  util.orgId = orgId;
  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res, null, true);
  
});

// Accès aux terminaux de l'organisation
router.get('/organization/getdevices', function(req, res) {

  var orgId = req.session.api_key.split('-')[1];
  console.log("Récupération des terminaux liés à l'organisation : "+orgId); 
  
  util.orgId = orgId;
  util.getDevices(req.session.api_key, req.session.auth_token, res);
  
});

//Accès à l'historique de data de l'organisation
router.get('/historian/:orgId', function(req, res) {

  var orgId = req.params.orgId;

  console.log("Récupération des données historiques liées à l'organisation : "+orgId); 
  
  var uri= historian_path;

  util.orgId = orgId;
  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res, req.query);
  
});

//Accès à l'historique de data de l'organisation pour les terminaux de type paramétré
router.get('/historian/:orgId/types/:deviceType', function(req, res) {

  var orgId = req.params.orgId;
  var deviceType = req.params.deviceType;

  console.log("Récupération des données historiques liées à l'organisation : "+orgId+" pour le type de terminal : "+deviceType); 
  
  var uri= historian_path + pathSeperator + types_path + pathSeperator + deviceType;

  util.orgId = orgId;
  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res, req.query);
  
});

//Accès à l'historique de data de l'organisation pour un terminal en particulier d'un certain type
router.get('/historian/:orgId/types/:deviceType/devices/:deviceId', function(req, res) {

  var orgId = req.params.orgId;
  var deviceType = req.params.deviceType;
  var deviceId= req.params.deviceId;

  console.log("Récupération des données historiques liées à l'organisation : "+orgId+" pour le terminal : "+deviceId);
    
  var uri= historian_path + pathSeperator + types_path + pathSeperator + deviceType +pathSeperator + devices_path + pathSeperator + deviceId ;

  util.orgId = orgId;
  util.iot_httpCall(uri, req.session.api_key, req.session.auth_token, res, req.query);
  
});


module.exports = router;

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
* Maxime MARTELLI
*******************************************************************************/
var util = {};

var https = require('https');
var querystring = require('querystring');

//Configuration de la connexion au service iot de Bluemix
var iot_foundation_api_options = {
  port: 443,
  rejectUnauthorized: false
};

util.orgId = null;

util.iot_httpCall = function( URI, api_key, auth_token, res, queryObj, sendCred){

  iot_foundation_api_options.hostname = util.orgId+'.internetofthings.ibmcloud.com';
  iot_foundation_api_options.auth = api_key + ':' + auth_token;
  iot_foundation_api_options.path=URI;
  if(queryObj){
    console.log("Requête appelée avec : "+querystring.stringify(queryObj)); 
    iot_foundation_api_options.path=URI+"?"+querystring.stringify(queryObj);
  }
  
  var http_req = https.get(iot_foundation_api_options, function(http_res) {
    var data = [];
    
    if (http_res.statusCode==200)
    {
      http_res.on('data', function(chunk) {
        data.push(chunk);
        
      });

      http_res.on('end',function(){
        var result = JSON.parse(data.join(''));
        if(sendCred){
          result.api_key = api_key;
          result.auth_token = auth_token;
        }
        // Renvoie la réponse
        res.json(result);
      });
    }
    else
    {
      console.log('Request for ' + iot_foundation_api_options.path + ' a échoué et renvoie le statut ' + http_res.statusCode);
      //Renvoie le statut
      res.status(http_res.statusCode).send();
    }

  });
  http_req.end();
  http_req.on('error', function(e) {
    console.log('Requête pour ' + iot_foundation_api_options.path + ' échoué avec l\'erreur : \n'+ e);
    res.status(500).send(e);
  });


};


// Configuration des terminaux connectés
util.getDevices = function( api_key, auth_token, res){
  
  iot_foundation_api_options.hostname = util.orgId+'.internetofthings.ibmcloud.com';
  iot_foundation_api_options.auth = api_key + ':' + auth_token;
  iot_foundation_api_options.path='/api/v0002/bulk/devices';

  var http_req = https.get(iot_foundation_api_options, function(http_res) {
    var data = [];

    if (http_res.statusCode==200)
    {
      http_res.on('data', function(chunk) {
        data.push(chunk);
        
      });

      http_res.on('end',function(){
        var result = JSON.parse(data.join(''));

        console.log("Nombre total de colonnes : "+result.meta.total_rows);

        // Envoie la réponse
        res.json(result.results);
      });
    }
    else
    {
      console.log('Requête pour ' + iot_foundation_api_options.path + ' a échoué et renvoie le statut http ' + http_res.statusCode);
      //Renvoie le statut
      res.status(http_res.statusCode).send();
    }

  });
  http_req.end();
  http_req.on('error', function(e) {
    console.log('Requête pour ' + iot_foundation_api_options.path + ' échoué avec l\'erreur \n'+ e);
    res.status(500).send(e);
  });

};

module.exports = util;
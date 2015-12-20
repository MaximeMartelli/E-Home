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

var orgId = "";
var orgName = "";
var isHistorian = false;
var api_key ="";
var auth_token = "";
var devices = [];

// Récupération des données liées à l'organisation
$.ajax
({
	type: "GET",
	url: "/api/v0002/organization",
	dataType: 'json',
	async: false,

	success: function (data, status, jq){

		orgId = data.id;
		orgName = data.name;
		api_key = data.api_key;
		auth_token = data.auth_token;
	},
	error: function (xhr, ajaxOptions, thrownError) {
		if(xhr.status === 401 || xhr.status === 403){
			console.log("Autorisation refusée. Vérifier votre clef API ou votre token d'authentification");
			window.location.href="loginfail";
		}
		console.log("Erreur dans la récupération des données de l'organisation");
		console.log(xhr.status);
		console.log(thrownError);
	}
});

//get the devices list of the org
$.ajax
({
	type: "GET",
	url: "/api/v0002/organization/getdevices",
	dataType: 'json',
	async: true,

	success: function (data, status, jq){

		devices = data;
		for(var d in devices){
			$("#deviceslist").append("<option value="+devices[d].clientId+">"+devices[d].deviceId+"</option>");
		}
	},
	error: function (xhr, ajaxOptions, thrownError) {
		console.log(xhr.status);
		console.log(thrownError);
	}
});

var realtime = new Realtime(orgId, api_key, auth_token);

var historian = new Historian();
$( "#deviceslist" ).change(function() {

	if(isHistorian){
		historian.plotHistoricGraph();
	} else {
		realtime.plotRealtimeGraph();
	}
	
});

//Active les options de récupération des valeurs historiques à l'aide des librairies historic et realtime
$('#historic').change(function() {
	$('#historicData').show(500);
	historian.plotHistoricGraph();
	isHistorian = true;
});

$('#realtime').change(function() {
	$('#historicData').hide(500);
	realtime.plotRealtimeGraph();
	isHistorian = false;
});

//Rafraichissement des graphes quand on change les paramètres
$( "#historicTopRange").on( "spinchange", function( event, ui ) {
	historian.plotHistoricGraph();
});

$( "#historicEnds" ).datetimepicker({ onChangeDateTime:function(dp,$input){
    historian.plotHistoricGraph();
  }
});
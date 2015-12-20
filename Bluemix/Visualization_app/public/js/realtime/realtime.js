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

var subscribeTopic = "";

var Realtime = function(orgId, api_key, auth_token) {

	var firstMessage = true;

	var clientId="a:"+orgId+":" +Date.now();

	console.log("clientId: " + clientId);
	var hostname = orgId+".messaging.internetofthings.ibmcloud.com";
	var client;

	this.initialize = function(){

		client = new Messaging.Client(hostname, 8883,clientId);
		console.log("API : "+api_key+"token MAX : "+auth_token);


		// Initialize the Realtime Graph
		var rtGraph = new RealtimeGraph();
		client.onMessageArrived = function(msg) {
			var topic = msg.destinationName;
			
			var payload = JSON.parse(msg.payloadString);
			//First message, instantiate the graph  
		    if (firstMessage) {
		    	$('#chart').empty();
		    	firstMessage=false;
		    	rtGraph.displayChart(null,payload);
		    } else {
		    	rtGraph.graphData(payload);
		    }
		};

		client.onConnectionLost = function(e){
			console.log("Connexion perdue à " + Date.now() + " : " + e.errorCode + " : " + e.errorMessage);
			this.connect(connectOptions);
		}

		// Connexion 
		var connectOptions = new Object();
		connectOptions.keepAliveInterval = 3600;
		connectOptions.useSSL=true;
		connectOptions.userName=api_key;
		connectOptions.password=auth_token;

		connectOptions.onSuccess = function() {
			console.log("MQTT connecté à l'hôte : "+client.host+" port : "+client.port+" à " + Date.now());
		}

		connectOptions.onFailure = function(e) {
			console.log("Connexion MQTT échouée " + Date.now() + "\nerreur: " + e.errorCode + " : " + e.errorMessage);
		}

		console.log("En cours de connexion à  " + client.host);
		client.connect(connectOptions);
	}

	// S'abonner au terminal choisi lors de sa sélection.
	this.plotRealtimeGraph = function(){
		var subscribeOptions = {
			qos : 0,
			onSuccess : function() {
				console.log("Abonné à : " + subscribeTopic);
			},
			onFailure : function(){
				console.log("Echec de l'abonnement à : " + subscribeTopic);
				console.log("La visualisation est donc impossible");
			}
		};
		
		var item = $("#deviceslist").val();
		var tokens = item.split(':');
		if(subscribeTopic != "") {
			console.log("Désabonnement de : " + subscribeTopic);
			client.unsubscribe(subscribeTopic);
		}

		//Efface les graphes précédents
		$('#chart').hide(function(){ 
			$('#chart').empty(); 
			$('#chart').show();
			$('#chart').append(imageHTML);
		});
		
		$('#timeline').empty();
		$('#legend').empty();
		firstMessage = true;

		// Permet la connection au terminal choisi
		subscribeTopic = "iot-2/type/" + tokens[2] + "/id/" + tokens[3] + "/evt/+/fmt/json";
		client.subscribe(subscribeTopic,subscribeOptions);
	}

	this.initialize();

	var imageHTML = '<div class="iotdashboardtext">Le terminal sélectionné n\'envoie pas de données en ce moment.</div><br><div class="iotdashboardtext">Vous pouvez analyser les données historiques ou sélectionner un autre terminal.</div> <img class="iotimagesMiddle" align="middle" alt="Chart" src="images/IOT_Icons_Thing02.svg">';
}

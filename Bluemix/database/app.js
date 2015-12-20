// Finir les états et gérer le cas 'Alarme capteur (longueur 2)'

var express = require('express'),
    url  = require('url'),
    qs = require('querystring'),
    http = require('http'),
    mqtt = require('mqtt'),
    host = (process.env.VCAP_APP_HOST || 'localhost'),
    twilio = require('twilio'),
    port = (process.env.VCAP_APP_PORT || 3000);


// Accès à l'environnement Cloud Foundry
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();

// Création de l'objet base de données
var Database = require("ibm_db").Database;
var Database2 = require("ibm_db").Database;
var Database3 = require("ibm_db").Database;
var ibmdb = new Database();
var ibmdb2 = new Database2();
var ibmdb3 = new Database3();



/****************************************************************************************************/
/********************************** Paramétrage du compte Twilio ************************************/
/****************************************************************************************************/
var accountSid, authToken;
var config = JSON.parse(process.env.VCAP_SERVICES);
// On parcourt les différences services, et on récupère celui correspondant au nom donné à Twilio sur le Tableau de Bord d'IBM
config['user-provided'].forEach(function(service) {
    if (service.name == 'iot-twilio') {					// iot-twilio correspond au nom donné
        accountSid = service.credentials.accountSID;
        authToken = service.credentials.authToken;
    }
});


/****************************************************************************************************/
/******************************* Déclaration des variables globales *********************************/
/****************************************************************************************************/
	// Table de correspondances des capteurs
	// 1-> Capteur 1, temperature 1
	// 2-> Capteur 1, humidite
	// 3-> Capteur 2, pression atm.
	// 4-> Capteur 3, passage
	// 5-> Capteur 2, temperature 2
	// 6-> Capteur 4, Potentiomètre

// Le capteur de passage a un traitement à part entière
var abonnement_etat = [0,0,0,0,0,0]; // Décrit l'état de l'abonnement température. 0 : pas d'alerte // TODO : faire un tableau pour tous les capteurs
var signe_abonnement = [1,1,1,1,1,1]; // -1 : Alarme si passage en dessous du seuil correspondant, 1 : de même, mais au dessus
var seuil = [40,80,950,0,45,90];				
var sauv_data = {};					  // Données par défaut
sauv_data.d = {Température1: 25.4,  Humidité: 40.5, Température2: 25.4, Pression: 1015.13, Luminosité: 60, Mouvement: 3,status: "ok"};
sauv_data.ts = "2015-12-06T18:09:41.164Z";
var num_twilio = '+33644607138';			// Numéro par défaut
var num_utilisateur = '+33629893230';
var etat_alarme = ['','','','','',''];

/****************************************************************************************************/
/***************************************** Gestion des MQTT *****************************************/
/****************************************************************************************************/

// Connexion MQTT
var client  = mqtt.connect('tls://yj5yyh.messaging.internetofthings.ibmcloud.com:8883', {clientId:'a:yj5yyh:databasebluemixmax',username:'a-yj5yyh-yoori5g0tl', password:'9Fyed2uZAWRMsyRrwn'});

// Gestion de la connexion. Lorsque la connexion est effectuée, on s'abonne aux évènements publiés par le device euro001 de type rasp2monitor. 
// On précise aussi que le message doit être de type JSON
client.on('connect', function (deviceType, deviceId, eventType, format, payload) {
    client.subscribe('iot-2/type/+/id/+/evt/+/fmt/+');
    console.log('Suscribed');
});
// Gestion de la réception d'une notification, on récupère donc le message envoyé, qu'on va ensuite ajouter à la base de données.
client.on('message', function (deviceType, deviceId, eventType, format, payload) {
    console.log('payload :'+deviceId);
    ajout_bd(deviceId); 
});

/****************************************************************************************************/
/************************************** Traitement des données **************************************/
/****************************************************************************************************/

// ajout_bd permet d'ajouter toutes les données contenues dans la chaine de caractères json_str dans la base de données
var ajout_bd = function(json_str) {
  // On convertit donc en JSON de nouveau
  var json = JSON.parse(json_str);

  console.log('AJOUT DE : '+json);
  // On ouvre la base de données
  ibmdb.open("DATABASE=SQLDB; HOSTNAME=75.126.155.153; UID=user11069; PWD=gFge18eRNESG; PORT= 50000; PROTOCOL=TCPIP", function(err){
	if (err) 
    {
      console.log(err);
      return;
    }
    // La fonction ajout permet d'ajouter un type de valeur et la date correspondante dans la base de données.
	var ajout = function(time,type,valeur) {

		var string_insert = 'INSERT INTO MESURE (TYPE_CAPTEUR, VALEUR, TS) VALUES ('+type+','+valeur+','+time+')';

		ibmdb.query(string_insert, function(err){
			if (err) {
	   			console.log("Interdit de rentrer dans cette boucle");
	   			console.log(err);
	   			return;
			}
			ibmdb.commitTransaction(function (err) {
      			if (err) {
       				//error during commit 
        			console.log(err);
        			console.log("Erreur durant le commit");
        			return;
      			}
    		});
		});
	}

	// Conversion de la date du format de la raspberry à celui utilisé par la base de données
	console.log("Récupération de la date : ");
	var array = json.ts.split(/[A-Z]/);
	var ts = '\''+array[0]+' '+array[1]+'000'+'\'';
	console.log(ts);
	
	// Table de correspondances des capteurs
	// 1-> Capteur 1, temperature 1
	// 2-> Capteur 1, humidite
	// 3-> Capteur 2, pression atm.
	// 4-> Capteur 3, passage
	// 5-> Capteur 2, temperature 2
	// 6-> Capteur 4, Potentiomètre
		
	// Ajouts des différentes valeurs de capteurs
	ajout(ts,1,json.d.Température1);
	ajout(ts,5,json.d.Température2);
	ajout(ts,3,json.d.Pression);
	ajout(ts,2,json.d.Humidité);
	ajout(ts,4,json.d.Mouvement);
	ajout(ts,6,json.d.Luminosité);

	//sauv_data.d = json.d;
	sauv_data.ts = json.ts;
	//console.log(sauv_data.ts);
     
	//var test_json = JSON.parse(test);
	//console.log(test_json.ID_MESURE);
	
	console.log('Etat : '+abonnement_etat);
	console.log('Signe : '+signe_abonnement);
	console.log('Seuil : '+seuil);
	// Vérification des abonnements	
	verif_abonnement(json.d);

	// Fermeture de la base de données
	ibmdb.close(function (err) {
    	if (err) {
        	return console.log(err);
    	}
     	console.log('Base de données fermée');
	});
  }); 
}

/****************************************************************************************************/
/*********************************** Fonction globale abonnements ***********************************/
/****************************************************************************************************/

var verif_abonnement = function(d) {
	send_abonnement(1, d.Température1);
	send_abonnement(2, d.Humidité);
	send_abonnement(3, d.Pression);
	send_abonnement(4, d.Mouvement);
	send_abonnement(5, d.Température2);
	send_abonnement(6, d.Luminosité);
}

/****************************************************************************************************/
/************************************ Fonction de gestion des abonnements ************************************/
/****************************************************************************************************/

// Table de correspondances des capteurs
	// 1-> Capteur 1, temperature 1
	// 2-> Capteur 1, humidite
	// 3-> Capteur 2, pression atm.
	// 4-> Capteur 3, passage
	// 5-> Capteur 2, temperature 2
	// 6-> Capteur 4, Potentiomètre

var send_abonnement = function(id_type_capteur, valeur) {
	// Traitement spécial du capteur de mouvement. En effet, une seule alarme de possible !
	if ( id_type_capteur == 4 ) {
		console.log('Gestion de l\'abonnement au capteur de mouvement : '+valeur);
		if (valeur >= 1 && abonnement_etat[id_type_capteur-1] == 1) {
			// Traitement de l'abonnement au capteur de passage
			var date = sauv_data.ts.split(/\D/);
			var direction = '';
			switch (valeur) {
				case 1 :
					direction = ' votre capteur a détecté un mouvement ';
					break;
				case 2 :
					direction = ' votre capteur a détecté un mouvement de la gauche vers la droite ';
					break;
				case 3 :
					direction = ' votre capteur a détecté un mouvement de la droite vers la gauche';
					break;
				case 4 :
					direction = ' votre capteur a détecté un mouvement de haut en bas';
					break;
				case 5 :
					direction = ' votre capteur a détecté un mouvement de bas en haut';
					break;
				case 6 :
					direction = ' votre capteur a détecté un mouvement de rapprochement';
					break;
				case 7 :
					direction = ' votre capteur a détecté un mouvement d\'éloignement';
					break;
				default :
					direction = '*autre*';		
			}
			
			var mess = 'Attention, à '+date[3]+'h'+date[4]+' le '+date[2]+'/'+date[1]+'/'+date[0]+direction;
			console.log('Message : '+mess);
			envoi(mess,num_utilisateur,num_twilio);	

    	}
    }
    else {
    	console.log('Gestion de l\'abonnement des autres capteurs. Valeur : '+valeur+' Type : '+id_type_capteur);

		if ( ( signe_abonnement[id_type_capteur-1]*(valeur - seuil[id_type_capteur-1]) > 0) && (abonnement_etat[id_type_capteur-1] == 1)) {
			var test = signe_abonnement[id_type_capteur-1]*(valeur - seuil[id_type_capteur-1]);
			console.log('Valeur de l\'abonnement :' +test);
			var array_correspondance = [' la température du capteur 1 ',' l\'humidité ',' la pression ',' le mouvement ',' la température du capteur 2 ',' la luminosité '];
			var array_unites = ['°C',' %',' hPa',' bla ','°C',' %'];

			// On découpe la date dans un tableau
			var date = sauv_data.ts.split(/\D/);
		
			var signe_syntaxe; // Variable utilisée pour avoir une grammaire correcte :P
			
			if ( signe_abonnement[id_type_capteur-1] == 1) {
				signe_syntaxe = 'a dépassé les ';
			}
			else {
				signe_syntaxe = 'est passée en dessous des ';
			}
			// Envoi du message
			var mess = 'Attention, à '+date[3]+'h'+date[4]+' le '+date[2]+'/'+date[1]+'/'+date[0]+array_correspondance[id_type_capteur-1]+signe_syntaxe+seuil[id_type_capteur-1]+array_unites[id_type_capteur-1];
			console.log('Message : '+mess);
			envoi(mess,num_utilisateur,num_twilio);	
		}
	}
}



/****************************************************************************************************/
/************************************ Création du serveur Twilio ************************************/
/****************************************************************************************************/

var twitwi = http.createServer(function (req, res) {

  if(req.url=='/yourresponse'){
  	var body = '';
	console.log('Début du traitement du message ');
  	req.setEncoding('utf8');

  	req.on('data', function(data) {
    		body += data;
  	});

  	req.on('end', function() {
  		// Récupération du message
    	var data = qs.parse(body);
    	var jsonString = JSON.stringify(data);
    	var jsonDataObject = JSON.parse(jsonString);
    	
    	
    	// Récupération des numéros
    	var to_send = jsonDataObject.From;
    	var from_twilio = jsonDataObject.To;
    	
    	//Sauvegarde des numéros en variable globale
		num_utilisateur = to_send;
		num_twilio = from_twilio;


    	
    	// Message reçu découpé en tableau
    	var text_array = jsonDataObject.Body.split(/ /);
    	var longueur_texte = text_array.length;

		// Initialisation de la réponse
    	var reponse_twilio = '';
    	var etat_string = '';

		// Traitement du message
		
		switch(text_array[0]) {
			case 'Capteurs':
			case 'Capteur':
			  	console.log('Gestion de la commande Capteurs : ');
				ibmdb2.open("DATABASE=SQLDB; HOSTNAME=75.126.155.153; UID=user11069; PWD=gFge18eRNESG; PORT= 50000; PROTOCOL=TCPIP", function(err){
					console.log('Récupération des valeurs dans la base de données');
					ibmdb2.describe({database : 'MESURE'}, function (error) {
						if (error) {
							console.log(error);
							reponse_twilio = 'Base de données vide';
							envoi(reponse_twilio,to_send,from_twilio);	

							return false;
						}
						
						// Récupération des dernières données de la base de données
						sauv_data.d.Température1 = ibmdb2.querySync("SELECT VALEUR FROM MESURE WHERE TYPE_CAPTEUR=1 ORDER BY MESURE.ID_MESURE DESC FETCH FIRST 1 ROWS ONLY")[0].VALEUR;
						sauv_data.d.Humidité = ibmdb2.querySync("SELECT VALEUR FROM MESURE WHERE TYPE_CAPTEUR=2 ORDER BY MESURE.ID_MESURE DESC FETCH FIRST 1 ROWS ONLY")[0].VALEUR;
						sauv_data.d.Pression = ibmdb2.querySync("SELECT VALEUR FROM MESURE WHERE TYPE_CAPTEUR=3 ORDER BY MESURE.ID_MESURE DESC FETCH FIRST 1 ROWS ONLY")[0].VALEUR;
						sauv_data.d.Température2 = ibmdb2.querySync("SELECT VALEUR FROM MESURE WHERE TYPE_CAPTEUR=5 ORDER BY MESURE.ID_MESURE DESC FETCH FIRST 1 ROWS ONLY")[0].VALEUR;
						sauv_data.d.Luminosité = ibmdb2.querySync("SELECT VALEUR FROM MESURE WHERE TYPE_CAPTEUR=6 ORDER BY MESURE.ID_MESURE DESC FETCH FIRST 1 ROWS ONLY")[0].VALEUR;
						var heure = ibmdb2.querySync("SELECT TS FROM MESURE WHERE TYPE_CAPTEUR=6 ORDER BY MESURE.ID_MESURE DESC FETCH FIRST 1 ROWS ONLY")[0].TS;
 						console.log('TEST TS : '+heure);
 						
 						// Découpage de la date
    					var time_array = heure.split(/\D/);
    					console.log('heure tableau : '+time_array);
 						
 						reponse_twilio = 'Les données à '+time_array[3]+'h'+time_array[4]+' le '+time_array[2]+'/'+time_array[1]+'/'+time_array[0]
								+' sont :\nTempérature (capteur 1) : '+sauv_data.d.Température1
								+'°C\nPression (capteur 1) : '+sauv_data.d.Pression
								+' hPa\nHumidité (capteur 1) : '+ sauv_data.d.Humidité 
								+' %\nTempérature (capteur 2) : '+sauv_data.d.Température2+'°C'
								+' %\nLuminosité (capteur 2) : '+sauv_data.d.Luminosité+' %' ;	
						envoi(reponse_twilio,to_send,from_twilio);	
 					
					});
					ibmdb2.close(function (err) {
    					if (err) {
        					return console.log(err);
    					}
     					console.log('Base de données fermée');
					});
  				}); 	
  				break;
			
			case 'Alarme':
			// Cas de gestion des alarmes

				console.log('Gestion des Alarmes');
				if (longueur_texte == 4) {
							
					if (text_array[1] == 'T1' || text_array[1] == 'H' || text_array[1] == 'P' || text_array[1] == 'T2' || text_array[1] == 'L') {
						var array_prov = ['T1','H','P','M','T2','L'];
						var indice = array_prov.indexOf(text_array[1]);
						abonnement_etat[indice] = 1;	
						
						var array_corresp = [' la température du capteur 1 ',' l\'humidité ',' la pression ',' le mouvement ',' la température du capteur 2 ',' la luminosité '];
						var array_2 = ['Température 1','Humidité', 'Pression', 'Mouvement','Température 2','Luminosité'];
						var array_unite = ['°C',' %',' hPa',' bla ','°C',' %'];

						abonnement_etat[indice] = 1;
						seuil[indice] = text_array[2];
				
						if (text_array[3] == '+' ){
							reponse_twilio = 'Vous venez d\'activer une alarme si'+array_corresp[indice]+ 'dépasse les '+text_array[2]+array_unite[indice];
							etat_string = array_2[indice]+' > '+text_array[2]+array_unite[indice]+'\n';
							signe_abonnement[indice] = 1;
							etat_alarme[indice] = etat_string;
						}
						else if (text_array[3] == '-' ){
							reponse_twilio = 'Vous venez d\'activer une alarme si'+array_corresp[indice]+ 'passe sous les '+text_array[2]+array_unite[indice];
							etat_string = array_2[indice]+' < '+text_array[2]+array_unite[indice]+'\n';
							signe_abonnement[indice] = -1;
							etat_alarme[indice] = etat_string;
						}
						envoi(reponse_twilio,to_send,from_twilio);	

					}
					else {
						reponse_twilio = 'Erreur format. \nCommandes alarmes :\n'
    							+'Alarme YY XX Z :\n'
    							+'  - YY peut prendre les valeurs T1, H, P, T2, M, L (correspond à chaque capteur)\n'
    							+'  - XX Valeur seuil\n'
		    					+'  - Z : + ou - \n\n';
	  					envoi(reponse_twilio,to_send,from_twilio);	
					}
				}
				else if (longueur_texte == 2 && text_array[1] == 'M') {
					console.log('Alarme de mouvement');
					reponse_twilio = 'Vous venez d\'activer une alarme si le capteur détecte un mouvement';
					abonnement_etat[3] = 1;
					etat_string = 'Détection de mouvement\n';
					etat_alarme[3] = etat_string;

					envoi(reponse_twilio,to_send,from_twilio);	
				}
				else {
					reponse_twilio = 'Erreur format. \nCommandes alarmes :\n'
    							+'Alarme YY XX Z :\n'
    							+'  - YY peut prendre les valeurs T1, H, P, T2, M, L (correspond à chaque capteur)\n'
    							+'  - XX Valeur seuil\n'
		    					+'  - Z : + ou - \n\n';
					envoi(reponse_twilio,to_send,from_twilio);
				}
				break;
			case 'Désactiver':
				// Cas de désactivation
				
				if (longueur_texte != 2) {
					reponse_twilio = 'Erreur format\nPour désactiver une alarme, écrire:\n"Désactiver T1" par exemple ou "Désactiver tout" ';
					console.log('Message d\'erreur, longueur différente de 2');
					envoi(reponse_twilio,to_send,from_twilio);	

				}
				else {
					console.log('Gestion de la désactivation');

					if (text_array[1] == 'T1' || text_array[1] == 'H' || text_array[1] == 'P' || text_array[1] == 'T2' || text_array[1] == 'M' || text_array[1] == 'L') {
						var array_prov = ['T1','H','P','M','T2','L'];
						abonnement_etat[array_prov.indexOf(text_array[1])] = 0;	
						reponse_twilio = 'Demande de désactivation bien prise en compte';
						envoi(reponse_twilio,to_send,from_twilio);	
						etat_alarme[array_prov.indexOf(text_array[1])] = '';
						console.log('Etat_texte : '+etat_alarme+'indice : '+array_prov.indexOf(text_array[1]));
	
					}
					else if (text_array[1] == 'tout') {
						abonnement_etat[0]=abonnement_etat[1]=abonnement_etat[2]=abonnement_etat[3]=abonnement_etat[4]=abonnement_etat[5]=0;
						reponse_twilio = 'Toutes les alarmes ont été désactivées';
						envoi(reponse_twilio,to_send,from_twilio);	
						
						etat_alarme = ['','','','','',''];
						console.log('Etat_texte : '+etat_alarme);
					}
					else {
						reponse_twilio = 'Erreur format\nPour désactiver une alarme, écrire:\n"Désactiver T1" par exemple ou "Désactiver tout" ';
						envoi(reponse_twilio,to_send,from_twilio);	
					}
				}
				break;
			case 'Etat':
				// Affichage des alarmes activées
				var array_correspondance = ['Température 1','Humidité','Pression','Bla','Température 2','Luminosité'];
				var array_unites = ['°C',' %',' hPa',' bla ','°C',' %'];
				var string_etat = etat_alarme.join('');
				if (string_etat == '' ) {
					reponse_twilio = 'Aucune alarme';
				}
				else {
					reponse_twilio = 'Alarmes activées : \n\n'+string_etat;
				}
				console.log('Fusion du tableau : '+string_etat);
				envoi(reponse_twilio,to_send,from_twilio);	

				console.log('Etat');
				break;
			
			case 'Purge':
				// Purge de la base de données

				ibmdb3.open("DATABASE=SQLDB; HOSTNAME=75.126.155.153; UID=user11069; PWD=gFge18eRNESG; PORT= 50000; PROTOCOL=TCPIP", function(err){
					console.log('Récupération des valeurs dans la base de données');
					ibmdb3.describe({database : 'MESURE'}, function (error) {
						if (error) {
							console.log(error);
							reponse_twilio = 'Base de données vide';
							envoi(reponse_twilio,to_send,from_twilio);	

							return false;
						}
						ibmdb3.querySync("DELETE FROM MESURE");
						reponse_twilio = 'Base de données purgée';
						envoi(reponse_twilio,to_send,from_twilio);	
				
						console.log('Purge');
							
					});
					ibmdb3.close(function (err) {
    					if (err) {
        					return console.log(err);
    					}
     					console.log('Base de données fermée');
					});
  				}); 	

				break;
				
			default:
				console.log('Case défaut');
			// Cas d'erreur syntaxique, explication du fonctionnement
				reponse_twilio = 'Erreur format. \nCommandes générales :\n\n'
					+'Capteurs : \nrenvoie les dernières valeurs de capteurs\n\n'
    				+'Alarme YY XX Z :\n'
    				+'  - YY peut prendre les valeurs T1, H, P, T2, L (correspond à chaque capteur)\n'
    				+'  - XX Valeur seuil\n'
			    	+'  - Z : + ou - \n\n'
			    	+'Alarme M : \n'
			    	+'  - Active la détection de mouvement\n\n'
			    	+'Etat : \n'
			    	+'Renvoie les alarmes actives\n\n'
			    	+'Purge : \n'
			    	+'	- Purge la base de données\n\n'
					+'Désactiver YY : \nDésactive l\'alarme liée au capteur YY\n\n'
					+'Désactiver tout : \nDésactive toutes les alarmes\n';
				envoi(reponse_twilio,to_send,from_twilio);	

		}		
 	});
  }
  /*
  Commandes :
    Capteurs : renvoie les dernières valeurs de capteurs
    Alarme YY XX Z :
    		- YY peut prendre les valeurs T1, H, P, T2, M, L (correspond à chaque capteur)
    		- XX Valeur seuil
    		- Z : + ou -
    Alarme M : 
 			- Active la détection de mouvement
	Etat : 
			- Renvoie les alarmes actives
	Désactiver YY : 
			- Désactive l'alarme liée au capteur
	Désactiver tout : 
			- Désactive toutes les alarmes
	Purge :
			- Purge base de données
  
  */
});



/****************************************************************************************************/
/*********************** Fonction d'envoi du message (permet d'être synchrone) **********************/
/****************************************************************************************************/


var envoi = function(sms,toooo,frommmm) {

	var client = new twilio.RestClient(accountSid, authToken);
	client.sendMessage({
    	to: toooo,
       	from: frommmm,
      	body: sms
    });
    console.log('Message envoyé : '+sms);
}

twitwi.listen(appEnv.port)

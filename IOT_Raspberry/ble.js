var mqtt = require('mqtt'),
   moment = require('moment'),
   noble = require('noble');

// Configuration du serveur MQTT
var client  = mqtt.connect('tls://yj5yyh.messaging.internetofthings.ibmcloud.com:8883', {clientId:'d:yj5yyh:rasp2monitor:euro001',username:'use-token-auth', password:'pq(jatiiAUtUylj6c&'});

/******************************************************************/
/*************** Définition des variables globales ****************/
/******************************************************************/
var rtosMac = '0017ea939da5';

var Gpio = require('onoff').Gpio, // Construction des objets GPIOs
  led = new Gpio(17, 'out');         // Exportation du GPIO 17 en sortie

/******************************************************************/
/******************* Configuration du bluetooth *******************/
/******************************************************************/

// A l'allumage de l'adaptateur, on commence le scan
noble.on('stateChange', function(state) {
   if (state === 'poweredOn'){
      console.log('Scan des terminaux commencé');
      noble.startScanning();
   }
   else {
      noble.stopScanning();
   }
});

// Des qu'on découvre un périphérique, cette fonction est lancée
noble.on('discover', function(peripheral) {
   var macAdress = peripheral.uuid;
   // Si on a trouvé l'adresse du BLE, on arrête le scan, et on traite le périphérique
   if (macAdress == rtosMac) {
      noble.stopScanning();
      // On se connecte au périphérique
      peripheral.connect(function(error) {
         console.log('BLE trouvé, connecté ('+ macAdress+')');
         var service_capt =  peripheral.advertisement.serviceUuids;
         console.log('Service uuid : '+ service_capt);
         peripheral.discoverServices(service_capt, function(error, services) {
            var deviceIndormationService = services[0];
            console.log('Connecté au service '+deviceIndormationService);
            deviceIndormationService.discoverCharacteristics(null, function(error, characteristics) {
               var message = characteristics[0];
               console.log('Connecté au handle '+message);
               // Activation des notifications
               message.notify(true, function(error) {
                  console.log('Notification activée');
               });

               // Se lance à la réception d'une donnée
               message.on('read', function(data, isNotification) {
                  // On convertit la donnée et on lance la fonction d'envoi au service Bluemix
                  var string_data = data.toString('utf8');
                  console.log('Data reçue : '+ data);
                  // Lance la gestion de l'envoi à Bluemix
                  send_bluemix(string_data);
               });               
            });
         });
      });
   }
})


/******************************************************************/
/******************* Envoi des données à Bluemix ******************/
/******************************************************************/

var send_bluemix = function(data) {

   var t1 = parseFloat(data.substring(0,3));
   var h = parseFloat(data.substring(3,6));
   var t2 = parseFloat(data.substring(6,9))/10;
   var p = parseFloat(data.substring(9,15))/100;
   var l = parseFloat(data.substring(15,18));
   var m = parseFloat(data.substring(18,19));
   
   console.log('Réception des données BLE - T1 : '+t1+' T2 : '+t2+' H : '+h+' P : '+p+' L : '+l+' M : '+m);

   var monval = {};
   monval.d = {Température1: t1, Humidité: h, Température2: t2, Pression: p, Luminosité: l, Mouvement: m, status: "ok"};
   monval.ts = moment().add(1,'h').toISOString();

   var payload = JSON.stringify(monval);

   console.log('Envoi MQTT de :'+payload);
   client.publish('iot-2/evt/itemsvc/fmt/json',payload);

   // Allume la LED pendant 1 seconde à l'envoi des données
   led.writeSync(1);

   var scint = setInterval(iv, 200);
   
   setTimeout(function () {
      clearInterval(scint); // Stop blinking
      led.writeSync(0);  // Turn LED off.
   }, 2000);
}

var iv = function() {
   led.writeSync(led.readSync() ^ 1); // 1 = on, 0 = off
}

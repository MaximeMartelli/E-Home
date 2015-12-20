var mqtt    = require('mqtt');
var moment = require('moment');
var client  = mqtt.connect('tls://yj5yyh.messaging.internetofthings.ibmcloud.com:8883', {clientId:'d:yj5yyh:rasp2monitor:euro001',username:'use-token-auth', password:'pq(jatiiAUtUylj6c&'});
 
var delayinms = 10000; // en ms
var suspend = false;
var variation = 3;

var Gpio = require('onoff').Gpio, // Construction des objets GPIOs
  led = new Gpio(17, 'out');         // Exportation du GPIO 17 en sortie


var doTask = function() {
  //var test = 3;
  //var test_str = test.toString();
  //console.log('test_str : '+ test_str);
  //var test_float = parseFloat(test_str);
   // Trame : T1 3 H 3 T2 4 P 5 L 3 M 1"


   var data = " 23 542351015431001";
   //var monval = {};
 // monval.d = {Température1: parseFloat(array[1]) + variation, Humidité: parseFloat(array[3])+ variation, Température2: parseFloat(array[5]) + variation, Pression: parseFloat(array[7]) + variation*10, Luminosité: parseFloat(array[9]), Mouvement: parseFloat(array[11]), status: "ok"};


   var t1 = parseFloat(data.substring(0,3));
   var h = parseFloat(data.substring(3,6));
   var t2 = parseFloat(data.substring(6,9))/10;
   var p = parseFloat(data.substring(9,15))/100;
   var l = parseFloat(data.substring(15,18));
   var m = parseFloat(data.substring(18,19));
   
   console.log('T1 : '+t1+' T2 : '+t2+' H : '+h+' P : '+p+' L : '+l+' M : '+m);

   var monval = {};
   monval.d = {Température1: t1, Humidité: h, Température2: t2, Pression: p, Luminosité: l, Mouvement: m, status: "ok"};
   monval.ts = moment().add(1,'h').toISOString();
   var payload = JSON.stringify(monval);
   //console.log('T1 : '+t1+' T2 : '+t2+' H : '+h+' P : '+p+' L : '+l+' M : '+m);
   
   //client.publish('iot-2/evt/itemsvc/fmt/json',payload);

   variation = -variation;

   // Allume la LED pendant 1 seconde à l'envoi des données
   led.writeSync(1);
   console.log('LED on');
   var scint = setInterval(iv, 200);
   
   setTimeout(function () {
      clearInterval(scint); // Stop blinking
      led.writeSync(0);  // Turn LED off.
      console.log('LED off');
   }, 2000);



   setTimeout(doTask, delayinms);
}
setTimeout(doTask, delayinms );


var iv = function() {
   console.log('Switch etat');
   led.writeSync(led.readSync() ^ 1); // 1 = on, 0 = off
}

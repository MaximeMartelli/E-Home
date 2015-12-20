# E-Home

Description du projet:

Ce projet a pour but de visualiser sur un terminal, les mesures en temps réel
des différents capteurs déployés.

Le projet peut être divisé en 4 parties :

Ø Environnement matériel : 
nous nous situons à l’amont de la chaîne globale.
Elle contient tous les capteurs disponibles (capteur de température, luminosité,
pression, etc.), la carte ARM et le BLE (Bluetooth Low-Energy). Les capteurs,
qui sont reliés à la carte ARM, sont contrôlés et sollicités de façon périodique
par le microcontrôleur. Toutes les valeurs mesurées par les capteurs seront
enregistrées dans une variable globale. Par la suite, le BLE va lire dans cette
variable globale puis émettre le résultat de la lecture vers le deuxième étage du
projet : la Raspberry Pi.

Ø Raspberry Pi 2 : 
cette plateforme permet de créer un serveur pour pouvoir
envoyer des données vers l’Internet. Elle va, via un petit module Bluetooth,
réceptionner toutes les données envoyées par le BLE. Puis, après traitement des
données, elle va envoyer toutes les données reçues via MQTT vers le service
Bluemix dans le cloud.

Ø Environnement Bluemix : 
celui-ci permet de déployer des applications dans
le cloud sans avoir à se soucier de la mémoire, de l’espace disque, de
l’installation du serveur et de sa configuration. Il comprend deux applications
et deux services qui sont Twilio et SQL Database. L’API SMS de Twilio permet
de gérer les sms entre les téléphones et l’application. Ainsi, ce service est utilisé
pour pouvoir afficher les dernières valeurs mesurées par les capteurs mais aussi
de contrôler, par des mots-clés, la base de données. Le deuxième service, SQL
Database, permet de stocker toutes les valeurs prises par les capteurs. Cette base
est très utile pour l’utilisateur qui souhaite obtenir les dernières valeurs sur son
smartphone. Il pourra également récupérer toutes les valeurs pour y effectuer
différents traitements (moyenne, statistiques, etc.). La première application
permet de gérer Twilio et la base de données, alors que la seconde application
permet de récupérer les données envoyées en live par les différents terminaux,
et d’afficher les données historiques stockées par le service IoT foundation.

Ø Interface client : 
ce dernier fournit deux possibilités pour interagir avec notre système.
- Si l’utilisateur dispose d’une connexion Internet :
Le lien suivant http://visualisationappmax.eu-gb.mybluemix.net/ permet de
visualiser les valeurs envoyées par n’importe quel terminal lié à notre
organisation, en temps réel, ou en récupérant l’historique des valeurs. Ces
valeurs sont directement intégrées dans un graphe qui peut prendre plusieurs
formes. Cette fonctionnalité est très intéressante si l’utilisateur souhaite
visualiser les tendances des différentes mesures sur de longues périodes de
temps.

- Si l’utilisateur ne dispose pas d’une connexion Internet :
Il peut envoyer un sms au numéro suivant +33 6 44 60 71 38 des mots-clés
spécifiques pour pouvoir par exemple interroger la base de données et
retrouver les dernières valeurs mesurées par les capteurs. Plusieurs
fonctionnalités ont été implémentées comme des systèmes d’alarme, des
systèmes de contrôle de base de données, etc. Toutes ces fonctionnalités
vous seront présentées dans la partie adéquat de ce tutoriel.

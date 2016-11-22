'use strict';

angular.module('app')

  .controller('indexController', function($scope, $location, $mdToast, osc) {

        //init all vars
        $scope.status = 'not connected';
        $scope.sentence = 'no sentence requested';

        var sendPort = 3334;
        var listenPort = 3333;
        var ip = "127.0.0.1"
        //setup need connections: Socket.IO & OSC

        //switch for local vs server development
        //var socket = io.connect('http://localhost:3000');
        var socket = io.connect('http://nmdserver.herokuapp.com');

        var udpPort = new osc.UDPPort({
            localAddress: ip,
            localPort: listenPort
        });

        /****************
         * OSC Over UDP *

         #Send
         Send following OSC-message "/getNewSentence" or "getCurrentSentence"

         #Listen
         Listen on "/newSentence" when a new sentence is pushed

         ****************/

        udpPort.on("message", function (osc) {
          console.log("An OSC message was received!", osc);
          if(osc.address == '/getCurrentSentence'){
            console.log("currentSentence requested");
            //the current sentence should only be requested at init of the app, any other time it will be automatically updated by the "/newSentence" event
            //it's available $scope.sentence and always up to date
            udpPort.send({
                address: "/newSentence",
                args: [$scope.sentence]
            }, ip, sendPort);
          } else if (osc.address == '/getNewSentence') {
            if($scope.status == "connected") {
              socket.emit('getNewSentence');
            }
          } else {
            console.log('Not a valid OSC event');
            udpPort.send({
                address: "/error",
                args: ["Not a valid OSC event"]
            }, ip, sendPort);
          }
        });

        udpPort.on("error", function (err) {
            console.log(err);
        });

        udpPort.open();

        $scope.testSend = function() {
          console.log('trigger send')
          udpPort.send({
              address: "/newSentence",
              args: ['test string', 100]
          }, ip, sendPort);
        };


        // SOCKET.IO

        $scope.getNewSentence = function() {
          console.log('get new sentence');
          socket.emit('getNewSentence');
        };

        socket.on('connect', function(){
          $scope.status = 'connected';
          //TO DO: replace by getCurrentSentence -- first implement in nmdServer
          socket.emit('getCurrentSentence');
        });

        socket.on('disconnect', function(){
          $scope.status = 'disconnected';
        });

        socket.on('newSentence', function(data) {
          //console.log(data);
          $scope.$apply(function() {
            $scope.sentence = data.string;
            $scope.score = data.score;
            $scope.scoreWord = data.scorePerWord;//.status.string;
          });

          udpPort.send({
              address: "/newSentence",
              args: [data.string]
          }, ip, sendPort);
        });

        /* OLD CODE TO B E REMOVED
        $scope.getNewSentence = function() {
      console.log('get new sentence');
      socket.emit('getNewSentence');
    };

    socket.on('connect', function(){
      $scope.status = 'connected';
      //TO DO: replace by getCurrentSentence
      socket.emit('getNewSentence');
    });

    socket.on('disconnect', function(){
      $scope.status = 'disconnected';
    });

    socket.on('newSentence', function(data) {
      //console.log(data);
      $scope.$apply(function() {
        $scope.sentence = data.string;
        $scope.score = data.score;
        $scope.scoreWord = data.scorePerWord;//.status.string;
      });

      udpPort.send({
          address: "/newSentence",
          args: [data.string, 100]
      }, "127.0.0.1", 57121);
    });
*/

  });

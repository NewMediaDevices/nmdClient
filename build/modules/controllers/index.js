'use strict';

angular.module('app')

  .controller('indexController', function($scope, $location, $mdToast, osc) {

        //init all vars
        $scope.status = 'not connected';
        $scope.sentence = 'no sentence requested';
        $scope.calls;
        $scope.recents = [];

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

        //Add calls
        $scope.addCall = function (description, team) {
          console.log('adding');
          var data = new Object();
          data.description = description;
          data.team = team;
          socket.emit('addCall', data);
          console.log("message: " + data.description + " & team: " + data.team);
        };
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
            var data = new Object();
            data.address = osc.address;
            data.args = osc.args;
            socket.emit('randomOSC', data);
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
          socket.emit('getCurrentSentence');
        });

        socket.on('getAllCalls', function(data){
          $scope.$apply(function() {
            $scope.calls = data;
          })
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

        socket.on('randomOSC', function(data) {
          console.log(data);
          $scope.$apply(function() {
            $scope.recents.unshift({
                msg: data.address,
                args: data.args
            })
          });
          udpPort.send({
              address: data.address,
              args: JSON.stringify(data.args)
          }, ip, sendPort);
        })
        socket.on('error', function(data) {
          alert(data);
        })
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

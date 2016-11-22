nmdCLient

============================

Electron client application for nmdProject EHB '16-'17.
This will integrate our dashboard app and takes care of the backend communication,
it listens to OSC-requests, handles them through websockets (Socket.IO) and responds with another OSC-message.

Original boilerplate: https://github.com/szwacz/electron-boilerplate.

## Howto

    # Install
    npm install --save

    cd app
    npm install --save

    # Start
    cd .. 
    npm start

    #Setup OSC
    this client application is listening on port 3333 & sending on port 3334, so if you set up your own application:

    localAddress: 127.0.0.1
    listen on port: 3334
    send on port: 3333

##Test OSC

  #Send
  Send following OSC-message "/getNewSentence" or "/getCurrentSentence"

  #Listen
  Listen on "/newSentence" when a new sentence is pushed

### It's a test
//TODO: omweg wegsnijden
//zie https://github.com/automata/osc-web

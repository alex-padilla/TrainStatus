# TrainStatus
TrainStatus is a chatbot enables users to query about real time status of London Underground, Overground, TFL Rail, DLR, and Tram lines.

## Prerequisites:
1. Install Node.js.
2. Install the SDK by running the following commands on command line:
  ..* npm install --save botbuilder
  ..* npm install --save restify
3. Install the [bot emulator](https://github.com/Microsoft/BotFramework-Emulator/releases/tag/v3.5.31 "Microsoft Bot Emulator").


## Instructions:
1. Download or clone this folder.
2. Open the command prompt.
3. Navigate to the directory of this folder you just downloaded.
4. To start the bot, run 'node app.js'
5. Open the bot emulator.
6. Type http://localhost:3978/api/messages into the address bar. (This is the default endpoint that your bot listens to when hosted locally.)
7. Click Connect. You won't need to specify Microsoft App ID and Microsoft App Password.
8. Once connected, you can query any status updates on the tube, overground, tfl rail, dlr, and tram lines.


## How to Query:
- You can query status updates on tube, london overground, tfl rail, dlr, and tram.
- Your queries are case insensitive.
- Queries can start with:
    - What is the status of victoria line?
    - Status of bakerloo, victoria
    - Bakerloo, metroPOLitan, piccadilly
- If queries contains valid line(s) and invalid lines, it will give back a response for the valid lines.
- This bot supports some of the most common spelling mistakes a user can make, or shortcut code for lines.
    - Picadilly or picadily

## Notice:
The TFL App ID and App Key in the code are purely for **demonstration purposes only**. If you want to register for one, visit the [TFL API website](https://api.tfl.gov.uk/ "TFL API website").

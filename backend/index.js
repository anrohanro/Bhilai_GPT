const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const Chat = require('./gemini');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const server = http.createServer(app);

// const wsServer1 = new WebSocket.Server({ noServer: true });
// const wsServer2 = new WebSocket.Server({ noServer: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
Chat();
// wsServer1.on('connection', (ws) => {
//     ws.on('message', (message) => {
//         console.log('Received from server 1: ', message);
//     });
// });

// wsServer2.on('connection', (ws) => {
//     ws.on('message', (message) => {
//         console.log('Received from server 2: ', message);
//     });
// });

// server.on('upgrade', (request, socket, head) => {
//     const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

//     if (pathname === '/ws1') {
//         wsServer1.handleUpgrade(request, socket, head, (ws) => {
//             wsServer1.emit('connection', ws, request);
//         });
//     } else if (pathname === '/ws2') {
//         wsServer2.handleUpgrade(request, socket, head, (ws) => {
//             wsServer2.emit('connection', ws, request);
//         });
//     } else {
//         socket.destroy();
//     }
// });

server.listen(5000).on('listening', () => {
    console.log('Server is listening on port 5000');
});
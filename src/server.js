require('babel/polyfill');

import http from 'http';
import path from 'path';
import express from 'express';

var app = express();

app.enable('case sensitive routing');

app.use(express.static(path.join(path.dirname(__dirname), 'public')));

app.get('/', function(req, res, next){
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function(err, req, res, next) {
  res.set('Content-Type', 'application/json')
     .status(err.code || 400)
     .json({'message': err.message || ''});
});

const host = process.env['IMAGE_GALLERY_HOST'] || '127.0.0.1';
const portHttp = parseInt(process.env['IMAGE_GALLERY_PORT_HTTP'] || 3000, 10);

var server = http.createServer(app);

server.listen(portHttp, function() {
  console.log('Server running on port ' + portHttp + ' (' + host + ')');
});

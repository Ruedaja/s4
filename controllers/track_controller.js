var fs = require('fs');
var track_model = require('./../models/track');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var async = require('async');
var FormData = require('form-data');


// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	var tracks = track_model.tracks;
	res.render('tracks/index', {tracks: tracks});
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista del formulario para subir una nueva canción con un error.
exports.new_error = function (req, res) {
	res.render('tracks/new_error');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {

	var track = track_model.tracks[req.params.trackId];
	track.id = req.params.trackId;
	res.render('tracks/show', {track: track});
	var track_url = track.url;
	console.log(track_url);
	request.get(track_url);
};

// Escribe una nueva canción en el registro de canciones.
exports.create = function (req, res) {

	var track = req.files.track;
	console.log('Fichero: : ', track);
	var id = track.name.split('.')[0];
	var name = track.originalname.split('.')[0];

	// Aquí debe implementarse la escritura del fichero de audio (track.buffer) en tracks.cdpsfy.es
	// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es
	var extension = track.extension;
	var url = 'http://www.tracks.cdpsfy.es/api/tracks';

	async.series([function(callback){
		var formData = {
			track: {
		    value:  track.buffer,
		    options: {
		      filename: name + "." + extension ,
					id : id,
					extension: extension,
		      contentType: track.mimetype
		    }
		  }
		};
		console.log(formData);
		request.post({
			url: url,
			formData: formData
		}
		, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
			callback(null, "error");
		}
	  	console.log('Upload OK: :', body);
			console.log("body: " + body);
			var bodyjson = JSON.parse(body);
			callback(null,bodyjson["url"]);
		});

	}],
	function(err,results){
		console.log("results: " + results.response);
		if(results.status != "error"){
			console.log(url + "/" +  results[0]);
			track_model.tracks[id] = {
				name: name,
				url: url +"/"+ results[0]
			};
		}
		res.redirect('/tracks');
	})
	// Escribe los metadatos de la nueva canción en el registro.

};

exports.destroy = function (req, res) {

	var trackId = req.params.id;
	var trackSelected = track_model.tracks[trackId];
	var diskName = trackSelected.diskName;
	var serverURL = 'http://www.tracks.cdpsfy.es/api/tracks/'+diskName;
	var request = require('request');
	request.post(serverURL, '');

	delete track_model.tracks[trackId];
	res.redirect('/tracks');
};
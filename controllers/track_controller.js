var fs = require('fs');
var track_model = require('./../models/track');
var querystring = require('querystring');
var http = require('http');

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
//OJO!!! CAMBIAR POR MONGODB
	var track = track_model.tracks[req.params.trackId];
	track.id = req.params.trackId;
	res.render('tracks/show', {track: track});
};

// Escribe una nueva canción en el registro de canciones.
exports.create = function (req, res) {

	var urlPostTracks = 'http://www.tracks.cdpsfy.es/api/tracks';

	
	var track = req.files.track;
	console.log('Data file. Data: ', track);

		var id = track.name.split('.')[0];
		var name = track.originalname.split('.')[0];
		
		console.log(name);
		console.log(id);

	
		var buffer = track.buffer;

		var format = track.extension;
		format.toLowerCase();
		console.log(format);

	 
		
		
			// Aquí debe implementarse la escritura del fichero de audio (track.buffer) en tracks.cdpsfy.es
			// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es
			var url = '';

			// Peticion POST para guardar la cancion en tracks.cdpsfy.es.
			var formData = {
				filename: name+'.'+format,
				my_buffer: buffer
			};

			request.post({url:urlPostTracks, formData: formData}, function optionalCallback(err, httpResponse, body) {
				if (err) {
		  			return console.error('Fallo al hacer upload:', err);

				} else{
			  		
			  		
			  		var newURL = 'http://www.tracks.cdpsfy.es/api/tracks/'+body;
			  		console.log('Upload succesfull from file: ', body);

			  		
					track_model.tracks[id] = {
						name: name,
						url: newURL,
						diskName: body
					};
				}
			});

			console.log("succesfull upload from the file.");
			res.render('tracks/new')
		
	}

};
// Borra una canción (trackId) del registro de canciones 
// A la api se llama por el nombre, por lo que recuperamos el diskname del modelo de datos.
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
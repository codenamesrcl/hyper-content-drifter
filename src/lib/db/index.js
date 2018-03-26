var path = require('path'),
	fs = require('fs-extra')
	;

var api = {}

api.test = function(){
	console.log(process.cwd());
	console.log(path.resolve('./job_log'));
}

api.get = function(filepath){
	var item = new JsonDB(filepath);

	var promise = new Promise(function(resolve, reject){
		//check to see if the db json exists for this name
		//if so, then fetch it
		//if not, then create an empty entry to use
		fs.readFile(filepath, 'utf8', (err, data) => {
			if(err){
				//no file, send a new instance of JsonDB
			}
			else{
				item.obj = JSON.parse(data);
			}
			resolve(item);
		});
	});
	
	return promise;
	
}

/**
 * Handles the writing of a JSON file
 */
function JsonDB(filepath){
	this.obj = {};
	this.filepath = filepath;
}
JsonDB.prototype.write = function(){
	var promise = new Promise(function(resolve, reject){
		fs.writeFile(this.filepath, JSON.stringify(this.obj), (err) => {
			if(err){
				reject(err);
			}
			resolve();
		})
	}.bind(this));
	
	return promise;
}

module.exports = api;
var runners = {
	
}

var series = require('../lib/helpers/seriesCall');

function runplz(batchset){
	console.log("runplz started")

	var promise = new Promise(function(resolve, reject){
		series.run(batchset, function(job){
			console.log('series run function called');
			var promise = new Promise(function(resolve, reject){
				if(runners[job._jobrunner]){
					var timestart = new Date();
					runners[job._jobrunner].run(job)
					    .then(function(){
					        console.log(job.name + ': done');
					        var timeend = new Date(),
					            diff = timeend - timestart,
					            elapsed = diff / 1000;

					        console.log("finished in %s seconds", elapsed);
					        resolve();
					    },
					    function(error){
					        console.log(error);
					        resolve(error);
					    });
				}
				else{
					console.log(job.name + ': job does not have a designated runner')
					resolve();
				}

			})

			return promise;
		})
		.then(
			function(){
				console.log('batch complete')
				resolve();
			},
			function(){
				console.log("batch error occured")
				reject();
			});
	});

	return promise;
}

module.exports = {
	run: runplz
}
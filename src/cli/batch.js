var _joblist = require('../jobs/_joblist');
var inquirer = require('inquirer');
var batchrunner = require('./batchrunner');

var batchset = [];

function batch(){
	var promise = new Promise(function(resolve, reject){
		var stage = function(){
			inquirer.prompt([
				{
					type: 'input',
					name: 'branch',
					message: 'batch >'	
				}
			])
			.then(answers => {
				answers.branch = answers.branch.trim();

				var arg = '';
				//split the args from the command if there are args
				if(answers.branch.indexOf(' ') > -1){
					arg = answers.branch.substr(answers.branch.indexOf(' ') + 1);
					answers.branch = answers.branch.substr(0, answers.branch.indexOf(' '));
				}

				if(answers.branch.length === 0){	
					stage();
				}
				switch(answers.branch){
					case 'add':
						search(arg);
						stage();
						break;
					case 'remove':
						remove(arg);
						stage();
						break;
					case 'exit':
						resolve();
						break;
					case 'run':
						batchrunner.run(batchset).then(
							function(){
								stage();
							},
							function(){
								stage();
							});
						break;
					case 'help':
						Object.keys(commands).forEach(function(name){
		  					console.log('- ' + name + ' - ' + commands[name].info);
		  				})
		  				stage();
						break;
					case 'status':
						batchset.forEach(function(item, index){	
							index++;
							console.log(index + '. ' + item.name);
						})
						stage();
						break;
					case 'ls':
						//list job list
						Object.keys(_joblist).forEach(function(item, index){
							index++;
							console.log(index + '. ' + item);
						});
						stage();
						break;
					default:
						console.log('--invalid command--');
						stage();
						break;
				}
			})
		}

		stage();
	})

	return promise;
}


function remove(term){
	var dex = parseInt(term);
	console.log(dex);
	if(typeof(dex) === 'number'){
		batchset.splice(dex - 1, 1);
		
	}
}

//based on a search using add, if the result is not perfect then suggest
//things that contain what has been inputed
//more or less a contains search
function search(term){
	
	var exact = Object.keys(_joblist).find(function(item){
		return term === item;
	})

	if(term.trim().length === 0){
		console.log('search term invalid');
	}

	if(exact){
		batchset.push(_joblist[exact]);
		console.log('--added-- ' + exact);
	}
	else{
		//do a contains search of the whole term
		//if one item comes up, auto add that item
		//if multiple items come up, list them as things that can be but need to be added manually using another add call
		//if nothing is found then say that nothing could be found
		var results = Object.keys(_joblist).filter(function(item){
			return item.toLowerCase().indexOf(term.toLowerCase()) > -1;
		})

		if(results.length === 0){
			console.log("no jobs found with the specified search term");
		}
		else if(results.length === 1){
			batchset.push(_joblist[results[0]]);
			console.log('--added-- ' + results[0]);
		}
		else{
			//multiple results found, list them out for further filtering by another add query
			console.log('multiple possible jobs found, please refine with a more specific add query');
			results.forEach(function(item){
				console.log(item);
			})
		}
	}
}









var commands = {
	exit: {info: 'finalize the batch list and return to the main menu'},
	help: {info: 'list available commands/subcontexts in the current context'},
	ls: {info: 'list the available jobs from the job listing'},
	add: {info: 'add a job to the batch.  uses a partial matching system for convenience.'},
	remove: {info: 'remove a job from the batch using the index in the batch'},
	status: {info: 'show the contents of the batch'},
	run: {info: 'run the queued batch job'},
}

module.exports = {
	info: 'create a batch using existing jobs from the set joblist to execute in succession',
	call: batch
}
console.log('HyperContentDrifter - CLI');
console.log('Created by codenamesrcl');
console.log('\n');

var inquirer = require('inquirer')
var readmanga = require('./lib/runner/readmanga');

var commands = {
	batch: require('./cli/batch'),
	exit: {info: 'exit the cli'},
	help: {info: 'list available commands/subcontexts in the current context'}
}

var output = [];

function base() {
  inquirer.prompt([
		{
			type: 'input',
			name: 'basecommand',
			message: ">"
		}
	])
  .then(answers => {
  		answers.basecommand = answers.basecommand.trim();

      var arg = '';
      //split the args from the command if there are args
      if(answers.basecommand.indexOf(' ') > -1){
        arg = answers.basecommand.substr(answers.basecommand.indexOf(' ') + 1);
        answers.basecommand = answers.basecommand.substr(0, answers.basecommand.indexOf(' '));
      }

      if(answers.basecommand.length === 0){  
        base();
      }


  		switch(answers.basecommand){
  			case 'exit':
  				console.log("cancel command, exiting application...")
          process.exit(1);
  				break;
  			case 'help':
  				Object.keys(commands).forEach(function(name){
            console.log('- ' + name + ' - ' + commands[name].info);
          })
  				base();
  				break;
  			case 'batch':
  				commands.batch.call().then(function(assembledbatch){
  					base();
  				});
  				break;
  			default:
  				console.log('--invalid command--');
  				//send off to the command branch of their choosing or designate it as a bad command
  				base();
  				break;
  		}
  		
  });
}

base();

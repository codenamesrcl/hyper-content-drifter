var nedb = require('nedb');

var dbChapter = new nedb({
    filename: "./db/test-chapters.json",  //db for chapter progress
    autoload: true  //autoloads synchronously
});
var dbPage = new nedb({
    filename: "./db/test-pages.json",  //db for page progress
    autoload: true  //autoloads synchronously
});

var host = {
    url: '', //root url for the host
    name: '', //name/label for the job
    destination: '', //where to save the packaged files
    concurrency: 5, //number of concurrent instances to run
    chapters: dbChapter,
    pages: dbPage,
    _jobrunner: ''  //base runner to use (must be from the runners list in "/cli/batchrunner")
};


module.exports = host;
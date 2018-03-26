module.exports = {
    run: run,
    generate: generate
};

//es7z is a rewrite of the node-7z module
//functionality is mostly left intact but there's now the option to manually
//specify the exe location of 7za.exe for a more flexible setup
var es7z = require("es-7z"),
    request = require('request'),
    fs = require('fs-extra'),
    _ = require('lodash');

var sevenz_exePath = require('path').resolve('./', '7z', '7za.exe');

//there's also a library on npm that's basically just a
//bin store called 7zip-bin which just brings in
//copies of the 7zip prebuilt binaries for all of the OS's (win, linux, mac) in both 64 and 32 bit
//and all it does is return a path to the executable depending on the OS
//this is currently used by packaging modules like for packing electron apps and things like that, so it makes sense

/**
 * handlers {
    download_success: function(packitem)
    download_error: function(packitem, error)
 }
 */

function run(packSet, tempname, archiveName, destination, eventhandlers){
    //download the files via http get and archive the resulting set of downloads to a designated drop
    //location
    if(!eventhandlers){
        eventhandlers = {};
    }

    //clean up the tempname to remove illegal characters
    tempname = tempname.replace(/\./g, '').replace(/\?/g, '')
        .replace(/\\/g, '').replace(/\//g, '')
        .replace(/\:/g, '').replace(/\;/g, '');

    console.log('download run called for ' + archiveName);
    //console.log(archiveName);
    //console.log(destination);

    var promise = new Promise(function(resolve,reject){
        var report = {
            errors: [],
            successes: []
        };

        var templocation = destination + '/[]temp/' + tempname;
        try{
            fs.ensureDirSync(templocation);
        }   
        catch(err){
            console.log(err);
            console.error('cannot guarantee temporary download location ' + templocation);
            reject(report)
        }     

        

        var packup = function(){
            es7z.add7z(destination + '/' + archiveName, templocation + '/*.*', {exePath: sevenz_exePath})
                // Equivalent to `on('data', function (files) { // ... });`
                .progress(function (files) {
                    //console.log("packing files");
                })
                // When all is done
                .then(function () {
                    console.log(archiveName + ': Packing done!');
                    resolve(report);
                })
                // On error
                .catch(function (err) {
                    console.error(err);
                    reject(report);
                });
        }

        if(packSet.length === 0){
            //everything has been downloaded, it just needs a repack
            packup();
        }
        else{
            //there are items to download first before packing
            var done = _.after(packSet.length, function(){
                console.log("packing: " + archiveName);

                //this is where the archive will be created
                //have the filelist handy because this will only delete the files that were created
                //by fs.writeFile, we dont' want to be clearing whole directories without verification of other contents for
                //any reason
                if(report.errors.length === 0){
                    packup();
                }
                else{
                    reject(report);
                }
            });
            try{
                packSet.forEach(function(item){
                    //console.log("attempting download of " + item.name)
                    request({
                            method: "GET",
                            url: item.url,
                            encoding: null,
                        },
                        function (error, response, body) {
                            try{
                                fs.writeFile(templocation + '/' + item.name, body, function (err){
                                    if (err){ 
                                        console.error(err); 
                                        if(eventhandlers.download_error){
                                            eventhandlers.download_error(item, err);
                                        }
                                    }
                                    else{}
                                    report.successes.push(item);

                                    if(eventhandlers.download_success){
                                        eventhandlers.download_success(item)
                                            .then(done);
                                    }
                                    else{
                                        done();
                                    }
                                });
                            }
                            catch(err){
                                console.error(err);
                                report.errors.push(item);
                                if(eventhandlers.download_error){
                                    eventhandlers.download_error(item, err)
                                        .then(done);
                                }
                                else{
                                    done();
                                }
                                
                                
                            }
                        });

                    //what will probably happen is that the files will go into a temporary download folder which will
                    //get added and created to a 7z archive
                    //in-memory doesn't seem like a neat enough option to pursue at this time
                    //though there is a command line switch that exists to use stdin as the input source for a file
                });
            }
            catch(err){
                console.error(err);
            }
        }
        
    });

    return promise;

}

function generate(downloadPack, destination){
    var promise = new Promise(function(resolve,reject){
        try{
            fs.writeFile(destination + '/output.json', JSON.stringify(downloadPack), function (err){
                if (err) throw err;
                console.log('The file has been saved!');
                resolve();
            });
        }
        catch(err){
            console.error(err);
            reject();
        }
    });

    return promise;
    //generates a downloadPack json for future run processing

}

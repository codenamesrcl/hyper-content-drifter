module.exports = {
    run: seriesRun
};

var _ = require('lodash');

//run a a set of async calls synchrounously to avoid potentially massive memory costs
//this can be moved over into a separate module
function seriesRun(list, call, concurrent, exitonreject){
    if(concurrent === null || concurrent === undefined || concurrent <= 0){
        concurrent = 1;
    }
    if(concurrent > list.length){
        concurrent = list.length;
    }

    var promise = new Promise(function(resolve,reject){
        var index = -1;

        var resultmap = [];
        var done = _.after(concurrent, function(){
            resolve(resultmap);
        });

        var caller = function(target){
            call(list[target])
                .then(
                    function(result){
                        resultmap[target] = result;
                        chainer();
                    },
                    function(err){
                        console.log(err);
                        if(exitonreject){
                            reject(err);
                        }
                        else{
                            chainer();
                        }
                    });
        };

        var chainer = function(){
            var target = ++index;
            if(list[target]){
                caller(target);
            }
            else{
                done(resultmap);
            }
        };

        //call chainer the amount of times to fill up the concurrent count
        for(startNum = 0; startNum < concurrent; startNum++){
            chainer();
        }

    });

    return promise;
}

//Concurrent Nightmare Runner Process
//made really simple (and probably stupid) by codenamesrcl


var seriesRun = require('./seriesCall').run;

var Nightmare = require('nightmare');

//we're going to extend nightmare with a cache-config action which
//will allow for us to inject values into the browser scope
Nightmare.action('cacheConfig', function (value, label, done) {
    this.evaluate_now(function(value, label) {
        window._lib = window._lib || {};
        window._lib.cache = window._lib.cache || {};
        window._lib.cache[label] = value;
    }, done, value, label);
});

function NightmareRunner(name){
    this.name = name;
    this.nightmare = Nightmare({ 
        show: false,
        webPreferences: {
            webgl: false,
            webaudio: false,
            images: false,
            plugins: false
        }
    });
    this.occupied = false;
}

function Runner(host){
    this.host = host;
    this.nightmares = [];

    this.host.concurrency = this.host.concurrency || 1;

    for(i = 0; i < this.host.concurrency; i++){
        this.nightmares.push(new NightmareRunner(i));
    }
}
Runner.prototype.getNightmare = function(){
    var runner = this;
    var promise = new Promise(function(resolve,reject){
        var interval = setInterval(function(){
            var targetdex = runner.nightmares.findIndex(function(item){
                return (item.occupied === false);
            });

            if(targetdex >= 0){
                clearInterval(interval);
                runner.nightmares[targetdex].occupied = true;
                resolve(targetdex);
            }
        }, 500);
    });

    return promise;
};
Runner.prototype.returnNightmare = function(index){
    this.nightmares[index].occupied = false;
};
Runner.prototype.endNightmares = function(){
    this.nightmares.forEach(function(nightmare){
        nightmare.nightmare.end();
    });
};
Runner.prototype.series = function(set, target){
    return seriesRun(set, target, this.host.concurrency, false);
};

module.exports = {
    Runner: Runner
};

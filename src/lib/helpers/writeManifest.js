var fs = require('fs-extra'),
    path = require('path')
    ;



function ManifestWriter(filepath){
    this.filepath = filepath;
}
ManifestWriter.prototype.write = function(){

};
ManifestWriter.prototype.load = function(){

};




module.exports = {
    Writer: ManifestWriter
};

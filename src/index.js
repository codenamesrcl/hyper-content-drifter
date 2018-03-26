console.log('place what you want here')


// clever use of array's reduce function to execute a loop of nightmare calls
// in sequence series, effectively using the same electron instance for the entire way through
// var urls = ['http://example1.com', 'http://example2.com', 'http://example3.com'];
// urls.reduce(function(accumulator, url) {
//         return accumulator.then(function(results) {
//             return nightmare.goto(url)
//                 .wait('body')
//                 .title()
//                 .then(function(result){
//                     results.push(result);
//                     return results;
//                 });
//         });
//     },
//     Promise.resolve([])).then(function(results){
//         console.dir(results);
//     });

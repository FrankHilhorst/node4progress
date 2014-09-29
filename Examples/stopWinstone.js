/**
 * New node file
 */
var node4progress = require("node4progressHttp")(null);
node4progress.stopWinstone(function(result){
	console.log(result);
});
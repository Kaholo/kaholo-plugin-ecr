const aws = require("aws-sdk");
const child_process = require("child_process")

module.exports.getEcr = function(settings, action) {
    return new aws.ECR({
        region: action.params.region,
        accessKeyId: action.params.accessKeyId || settings.accessKeyId,
        secretAccessKey: action.params.secretAccessKey || settings.secretAccessKey
    });
}

module.exports.executeCmd = async function(command){
	return new Promise((resolve,reject) => {
		child_process.exec(command, (error, stdout, stderr) => {
			if (error) {
			   return reject(error);
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
			}
			return resolve(stdout);
		});
	})
}

module.exports.operationCallback = function (resolve,reject) {
    return function(err,result){
        if (err) reject(err);
        else resolve(result);
    }
}

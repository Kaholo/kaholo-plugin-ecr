const aws = require("aws-sdk");
const child_process = require("child_process")

function getEcr(action, settings) {
    return new aws.ECR({
        region: handleAutoComplete(action.params.region),
        accessKeyId: action.params.accessKeyId || settings.accessKeyId,
        secretAccessKey: action.params.secretAccessKey || settings.secretAccessKey
    });
}

async function executeCmd(command){
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

function operationCallback(resolve,reject) {
    return function(err,result){
        if (err) reject(err);
        else resolve(result);
    }
}

function handleAutoComplete(param){
	if (param && typeof(param) === "object" && param.hasOwnProperty("id")){
		return param.id;
	}
	return param;
}

module.exports = {
    getEcr,
    executeCmd,
    operationCallback
};

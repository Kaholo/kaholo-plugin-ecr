const aws = require("aws-sdk");
const child_process = require("child_process")

function getEcr(action, settings) {
    return new aws.ECR({
        region: handleAutoComplete(action.params.region),
        accessKeyId: action.params.accessKeyId || settings.accessKeyId,
        secretAccessKey: action.params.secretAccessKey || settings.secretAccessKey
    });
}

function getEc2(params, settings) {
    return new aws.EC2({
        region: handleAutoComplete(params.region),
        accessKeyId: params.accessKeyId || settings.accessKeyId,
        secretAccessKey: params.secretAccessKey || settings.secretAccessKey
    });
}

function getLightsail(params, settings) {
    return new aws.Lightsail({
        region: handleAutoComplete(params.region),
        accessKeyId: params.accessKeyId || settings.accessKeyId,
        secretAccessKey: params.secretAccessKey || settings.secretAccessKey
    });
}

async function executeCmd(command) {
    return new Promise((resolve, reject) => {
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

function operationCallback(resolve, reject) {
    return function (err, result) {
        if (err) reject(err);
        else resolve(result);
    }
}

function handleAutoComplete(param) {
    if (param && typeof (param) === "object" && param.hasOwnProperty("id")) {
        return param.id;
    }
    return param;
}

function getRegistryIdFromImageName(imageName) {
    // example: 780631210217.dkr.ecr.eu-central-1.amazonaws.com/builderjammy
    const registryID = imageName.match('[0-9]{12}')?.toString();
    if (registryID) {
        return registryID;
    }
    throw new Error("Image name does not contain a 12-digit ECR registryId - please use the Docker plugin instead.");
}

module.exports = {
    getEcr,
    getEc2,
    getLightsail,
    executeCmd,
    operationCallback,
    getRegistryIdFromImageName
};

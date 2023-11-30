const helpers = require('./helpers');
const { listRegions } = require('./autocomplete');
var URL = require('url').URL;

async function getEcrLogin(action, settings){
    const ecr = helpers.getEcr(action, settings);
    
    let registryIds;
    if(typeof action.params.registryIds == "string"){
        registryIds = [action.params.registryIds];
    } else {
        registryIds = action.params.registryIds;
    }

    if(!registryIds){
        throw "You must specify registry IDs";
    }

    const authToken = await new Promise((resolve,reject)=>{
        ecr.getAuthorizationToken({registryIds},helpers.operationCallback(resolve,reject));
    });

    authToken.authorizationData.forEach(authData=>{
        const [user, password] = Buffer.from(authData.authorizationToken, 'base64').toString('utf-8').split(':');
        const host = new URL(authData.proxyEndpoint).host;
        
        authData.decodedToken = {host, user, password};
        authData.baseDockerLoginCommand = `docker login --username ${user} --password "${password}" ${host}`
    })

    return authToken;
}

async function runDockerFuncOnECR(action, settings, dockerCmd){
	const registryId = helpers.getRegistryIdFromImageName(action.params.imageName);
    action.params.registryIds = [registryId];
    
    const loginData = await getEcrLogin(action, settings);
    const authData = loginData.authorizationData[0];
    const loginCommand = `${authData.baseDockerLoginCommand}`
    
    const fullCommand = [
        loginCommand,
        dockerCmd,
    ].join(' && ');
    let hasErr;
    let pushResult;
    
    try{
        pushResult = await helpers.executeCmd(fullCommand);
    } catch (err){
        hasErr = err;
    }
    
    const logoutRes = await helpers.executeCmd(`docker logout ${authData.decodedToken.host}`);
    
    if(hasErr){
        const errMsg = hasErr.message.replace(authData.decodedToken.password, '<DOCKER_PASS>')
        throw [errMsg, logoutRes].join('\n');
    }

    return [fullCommand.replace(authData.decodedToken.password, '<DOCKER_PASS>'), pushResult, logoutRes].join('\n');
}

async function pullImage(action, settings){
    return runDockerFuncOnECR(action, settings, `docker pull ${action.params.imageName}`);
}

async function pushImageToRepo(action, settings){
    return runDockerFuncOnECR(action, settings, `docker push ${action.params.imageName}`);
}

async function describeRepositories(action, settings){
    const registryId = action.params.registryId;

    const ecr = helpers.getEcr(action, settings);

    const repositories =  await new Promise((resolve,reject)=>{
        ecr.describeRepositories({registryId}, helpers.operationCallback(resolve,reject))
    });

    return repositories;
}

module.exports = {
    describeRepositories,
    pushImageToRepo,
    getEcrLogin, 
    pullImage,
    // autocomplete
    listRegions
};

const helpers = require('./helpers');

async function getEcrLogin(settings, action){
    const ecr = helpers.getEcr(settings, action);
    
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
        const host = require('url').parse(authData.proxyEndpoint).host;
        
        authData.decodedToken = {host, user, password};
        authData.baseDockerLoginCommand = `docker login --username ${user} --password "${password}" ${host}`
    })

    return authToken;
}

async function pushImgaeToRepo(settings, action){
    const {repoName, imageName, remoteTag, registryId} = action.params;
    action.params.registryIds = [registryId];
    
    const loginData = await getEcrLogin(settings,action);
    const authData = loginData.authorizationData[0];
    const hostImageName = `${authData.decodedToken.host}/${repoName}:${remoteTag || "latest"}`
    const loginCommand = `${authData.baseDockerLoginCommand}/${repoName}`
    
    const fullCommand = [
        loginCommand,
        `docker tag ${imageName} ${hostImageName}`,
        `docker push ${hostImageName}`,
        `docker image rm ${hostImageName}`
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

async function describeRepositories(settings, action){
    const registryId = action.params.registryId;

    const ecr = helpers.getEcr(settings, action);

    const repositories =  await new Promise((resolve,reject)=>{
        ecr.describeRepositories({registryId},helpers.operationCallback(resolve,reject))
    });

    return repositories;
}

module.exports = {
    describeRepositories,
    pushImgaeToRepo,
    getEcrLogin
};

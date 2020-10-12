# kaholo-plugin-ecr
AWS ECR plugin for Kaholo
This plugin is based on [aws-sdk API](https://www.npmjs.com/package/aws-sdk) and you can view all resources on [github](https://github.com/aws/aws-sdk-js)

## Method: Describe Repositories

**Description**

This method calls ECR [describeRepositories](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECR.html#describeRepositories-property)

**Parameters**
1. Access Key - This is a parameter taken from the vault to access AWS
2. Secret Key - This is a paramer taken from the vault to access AWS
3. Region - Select a region from the appeard list.
4. Registry ID - The AWS account ID associated with the registry that contains the repositories to be described. If you do not specify a registry, the default registry is assumed.


## Method: Push image to repo

**Description**

This method is a wrapper for docker-cli. And therefore the docker-cli must be preinstalled on the agent.

The method is doing the following:
* `docker login` to ECR repository
* `docker tag` - Tag the selected image with the repository namespace
* `docker push` - Push the namespaced tag to the ECR repository
* `docker image rm` - Remove the namespaced tag
* `docker logout` - To remove the ECR credentials

**Parameters**
1. Access Key - This is a parameter taken from the vault to access AWS
2. Secret Key - This is a paramer taken from the vault to access AWS
3. Region - Select a region from the appeard list.
4. Registry ID - The AWS account ID associated with the registry that contains the repositories.
5. Repository Name - The name of the repository inside the registry
6. Image to push - The name and tag of the image you wish to push.
7. Pushed image tag - The name of the tag that will be created on your repository.


## Method: Get Authorization Token

**Description**

This method calls ECR [getAuthorizationToken](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECR.html#getAuthorizationToken-property).
Additionally in order to allow easier working with it, an additional parsing is being done to the reponse which adds the following fields to each `authorizationData` object:
* decodedToken - Object containing the parsed `host`, `user`, `password`
* baseDockerLoginCommand - A base docker login command which can be used later for connecting your docker daemon. In the format: `docker login --username ${user} --password "${password}" ${host}`

**Parameters**
1. Access Key - This is a parameter taken from the vault to access AWS
2. Secret Key - This is a paramer taken from the vault to access AWS
3. Region - Select a region from the appeard list.
4. Registry IDs (String | Array<String>) - The registry IDs you wish to generate authorization token for.
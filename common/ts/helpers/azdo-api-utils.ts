import * as tl from 'azure-pipelines-task-lib/task';
import * as request from 'request';
import { getAuthToken } from './azdo-server-utils';

export function addBuildProperty(propertyName: string, propertyValue: string)
: Promise<any> {
  return new Promise((resolve, reject) => {
    var collectionUri = tl.getVariable('System.TeamFoundationCollectionUri') + '/';
    var teamProjectId = tl.getVariable('System.TeamProjectId') + '/';
    var buildId = tl.getVariable('Build.BuildId');
  
    var bodyToPost = `[{
      "op": "add", "path": "/${propertyName}" , "value": "${propertyValue}"
    }]`;

    tl.debug(bodyToPost);

    var options = {
      url:
        collectionUri +
        teamProjectId +
        `_apis/build/builds/${buildId}/properties?api-version=5.0-preview.1`,
      headers: {
        'Content-Type': 'application/json-patch+json'
      },
      auth: {
        bearer: getAuthToken()
      },
      body: bodyToPost
    };

    request.patch(options, (error, response, body) => {
      if (error) {
        tl.error('Failed to update build properties, error was : ' + JSON.stringify(error));
        return reject();
      }
      tl.debug(`Response: ${response.statusCode} Body: "${JSON.stringify(body)}"`);
      return resolve();
    });
  });
}
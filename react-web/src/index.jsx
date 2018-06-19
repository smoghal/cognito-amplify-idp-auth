import React from 'react';
import ReactDOM from 'react-dom';

import Amplify from 'aws-amplify';
import AWS from 'aws-sdk';

// TODO - check process.env and load config_dev or config_prod
import config from './config_dev';

import App from './components/app';
import AppHeader from './components/header';

//AWS SDK & AWS Amplity Configuration
AWS.config.region = config.AWS_REGION;
Amplify.configure({
  Auth: {
    identityPoolId: config.AWS_COGNITO_IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
    region: config.AWS_REGION, // REQUIRED - Amazon Cognito Region
    userPoolId: config.AWS_COGNITO_USER_POOL_ID, //OPTIONAL - Amazon Cognito User Pool ID
    userPoolWebClientId: config.AWS_COGNITO_CLIENT_ID, //OPTIONAL - Amazon Cognito Web Client ID
    oauth: {
      domain: config.AWS_COGNITO_CLIENT_DOMAIN_NAME,
      scope: config.AWS_COGNITO_IDP_OAUTH_CLAIMS,
      redirectSignIn: config.AWS_COGNITO_IDP_SIGNIN_URL,
      redirectSignOut: config.AWS_COGNITO_IDP_SIGNOUT_URL,
      responseType: config.AWS_COGNITO_IDP_GRANT_FLOW
    }
  }
});
console.log('Amplify configured');

ReactDOM.render(

  <div>
    <AppHeader />
    <App />
  </div>

  , document.querySelector('.app-container'));

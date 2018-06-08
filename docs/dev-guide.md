# React Web Application

The sample React Web Application uses [AWS Amplify][aws-amplify] framework.  The first step in configuring AWS Amplify for the sample web application is to edit `src/config_dev.jsx`.  Update configuration file properties (below) to match your Cognito configuration before launching or deploying the application.  Contact your infrasrtructure team (or the person responsibile for setting up Cognito and ADFS authentication as documented earlier) to get the values for each of the following fields.

- `AWS_REGION`: cognito pool region,
- `AWS_COGNITO_IDENTITY_POOL_ID`: identity pool id
- `AWS_COGNITO_USER_POOL_ID`: user pool id
- `AWS_COGNITO_CLIENT_ID`: app client id
- `AWS_COGNITO_CLIENT_DOMAIN_NAME`: domain name
- `AWS_COGNITO_IDP_NAME`: SAML Identity Provider name
- `AWS_COGNITO_IDP_SIGNIN_URL`: sign in URL (this is web application url that will initialize AWS Amplify SDK)
- `AWS_COGNITO_IDP_SIGNOUT_URL`: sign out URL
- `AWS_COGNITO_IDP_GRANT_FLOW`: possible values are 'code' or 'token'


Refer to `src/index.jsx` and review how [AWS Amplify][aws-amplify] is configured (code snippet below) before the sample React Web Application starts.  Note that the variables defined in `src/config_dev.jsx` are imported and used in [AWS Amplify][aws-amplify] initialization.

```Javascript
import Amplify from 'aws-amplify';
import AWS from 'aws-sdk';
import config from './config_dev';

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
```

Review the rest of the sample React Web Application to understand how [AWS Amplify][aws-amplify] is used to perform authentication against Cognito, which is configured with iDP (ADFS).  Once the [AWS Amplify][aws-amplify] is configured and initialized, it is trival to invoke AWS AppSync calls from the web application.  Refer to [AWS Amplify GraphQL Endpoint][aws-amplify-appsync] documentation for more details.

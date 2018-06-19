const config = {
  AWS_REGION: 'SETME',
  AWS_COGNITO_IDENTITY_POOL_ID: 'SETME',
  AWS_COGNITO_USER_POOL_ID: 'SETME',
  AWS_COGNITO_CLIENT_ID: 'SETME',
  AWS_COGNITO_CLIENT_DOMAIN_NAME: 'SETME',
  AWS_COGNITO_IDP_NAME: 'SETME',
  AWS_COGNITO_IDP_SIGNIN_URL: 'SETME',  // must match cognito setting
  AWS_COGNITO_IDP_SIGNOUT_URL: 'SETME', // must match cognito setting
  AWS_COGNITO_IDP_OAUTH_CLAIMS: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
  AWS_COGNITO_IDP_GRANT_FLOW: 'code' // 'code' or 'token'
};

export default config;

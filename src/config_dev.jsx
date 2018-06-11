const config = {
  AWS_REGION: '',
  AWS_COGNITO_IDENTITY_POOL_ID: '',
  AWS_COGNITO_USER_POOL_ID: '',
  AWS_COGNITO_CLIENT_ID: '',
  AWS_COGNITO_CLIENT_DOMAIN_NAME: '',
  AWS_COGNITO_IDP_NAME: '',
  AWS_COGNITO_IDP_SIGNIN_URL: 'http://localhost:8080/redirect',  // must match cognito setting
  AWS_COGNITO_IDP_SIGNOUT_URL: 'http://localhost:8080/signout', // must match cognito setting
  AWS_COGNITO_IDP_OAUTH_CLAIMS: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
  AWS_COGNITO_IDP_GRANT_FLOW: 'code' // 'code' or 'token'
};

export default config;

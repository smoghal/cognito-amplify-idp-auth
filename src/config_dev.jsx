const config = {
  AWS_REGION: 'us-east-1',
  AWS_COGNITO_IDENTITY_POOL_ID: 'us-east-1:01b8644e-6338-41d1-8a19-f987435f15bf',
  AWS_COGNITO_USER_POOL_ID: 'us-east-1_Fxj4Fuz4k',
  AWS_COGNITO_CLIENT_ID: '3r3p0etv2rcei0cji53dvu08vd',
  AWS_COGNITO_CLIENT_DOMAIN_NAME: 'bgtest1.auth.us-east-1.amazoncognito.com',
  AWS_COGNITO_IDP_NAME: 'moghals',
  AWS_COGNITO_IDP_SIGNIN_URL: 'http://localhost:8080/redirect',  // must match cognito setting
  AWS_COGNITO_IDP_SIGNOUT_URL: 'http://localhost:8080/redirect', // must match cognito setting
  AWS_COGNITO_IDP_OAUTH_CLAIMS: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
  AWS_COGNITO_IDP_GRANT_FLOW: 'code' // 'code' or 'token'
};

export default config;

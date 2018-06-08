# Configure Cognito User Pool

The assumption in this section is that a Cognito User Pool has already been created that we will configure with SAML idP.  If a user pool does not exist, create one with default values.  Note down the `User Pool Id` as it will be used in following sections.

### Create App client

- Go to General Settings > App clients.  Add a new app client.  Make sure `Generate client secret` is unchecked.  Note down the `App client id` of the new app client.  This will be used later.

### Create Domain Name

- Go to App Integration > Domain name.  Create a domain name if you haven't done so. This domain will be used in the application configuration later.  Note down the name of fully qualified domain in this format `https://<domain prefix>.auth.us-east-1.amazoncognito.com`.

### Configure SAML idP

- Go to Federation > Identity Providers.  Click SAML
- Under `Add Metada Document` provide the the URL of FederationMetada.xml document.  For example:
  `https://sts.<domain_name>/FederationMetadata/2007-06/FederationMetadata.xml`
- Set the Provider Name to something meaningful, e.g. `adfs`
- Check `Enable idP sign out flow`
- Save the new SAML provider settings

### Configure OAuth

- Go to App Integration > App Client Settings and check `adfs` (your new SAML provider) under `Enabled Id Provider`
- Under `Sign in and sign out URLs` set as follows (note these URLs are only for development and testing purposes.  In a production configuration, the URLs will point to a Route53 or CloudFront enabled application URL)
  * Callback URL: http://localhost:8080/redirect
  * Signout URL: http://localhost:8080/redirect
- Under `OAuth 2.0`, select `Authorization code grant` and `Implicit grant`
- Under `Allowed OAuth Scopes`, only check `phone`, `email`, `openid`, `aws.cognito.signin.user.admin`.  Refer to the [blog post][blog1] for more details.

### Configure SAML Attribute Mapping

- Go to Federation > Attribute Mapping.  Click SAML
- Select your SAML provider from the drop down
- Set the following mapping:
  * Catpure: Checked
  * SAML Attribute: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress (you can refer to FederationMetadata.xml downloaded earlier for more information on the claim and exact url.  If there are other claims you want to map, refer to this file.)
  * User pool attribute: Email

Note: It is possible to capture custom User Pool attriubtes here as well.  To map custom attributes, make sure that the custom attribute are both read and write enabled by going to General Setting > App Clients > Show Details > Set attribute read and write permissions.  Select the custom attribute in both read and write columns and hit `Save app client changes`

### Create Identity Pool

Identity Pool is needed by AWS Amplify SDK used in the React web application.  It is used to pass temporary AWS credentials such that the idP user signed into web application via Cognito is able to invoke AWS services (AppSync, S3 etc) without needing an actual IAM user.

- Log into your AWS account and launch Cognito service from the AWS dashboard
- On the top, next to User Pool, click on `Federated Identities`
- Click `Create new identity pool`.  Assign a unique identify pool name
- Expand `Authentication Providers`.  Click on Cognito
- Fill in the `User Pool ID` and `App client id` values.  These were created earlier in this section.
- Click `Create Pool` button.
- If you are prompted to create IAM roles, create them.  You can later tweak these roles to give access to additional AWS services to Cognito idP users.

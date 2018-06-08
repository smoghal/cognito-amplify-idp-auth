# Table of Contents
* [Overview](#overview)
* [Cognito Setup](#cognito-seutp)
* [Identity Provider Setup](#identity-provider-setup)
* [Web Application Developer Guide](#web-application-developer-guide)
* [Native Application Developer Guide](#native-application-developer-guide)

# Overview

This sample web application demonstrate how to use AWS Amplify with a Cognito User Pool which integrates with a SAML identity provider (ADFS). There are a few goals of this exercise:

- Outline steps necessary to configure ADFS for Cognito User Pool integration
- Highlight the necessary configuration that must be done in Cognito User Pool and Cognito Identity Pool
- Demonstate how it is possible to avoid using Cognito Hosted UI in a web application
- Show case the power of AWS Amplify for web applications and how easy it is to integrate with Cognito User Pool for Authentication

# Cognito Setup

Follow the instructions in [Cognito Setup Guide][cognito-setup-guide] to properly configure Amazon Cognito service with SAML Identity Provider (ADFS).

# Identity Provider Setup

A SAML Identity Provider (idP), i.e. ADFS, must be properly configured such that Amazon Cognito can receive SAML request from idP for authentication and user pool federation, and such that idP can also receive signed SAML requests from Amazon Cognito to logout a user.  Refer to the [Identity Provider Setup Guide][idp-seutp-guide] for detailed instructions.

# Web Application Developer Guide

In order to authenticate with Amazon Cognito, that is configured with a SAML idP, certain configuration steps must be taken in a web application.  In particular, the recommended way to interact with Cognito user pool is by using [AWS Amplify][aws-amplify].  In addition, web application must be written using React (React Native), Angular 5+/Ionic, VueJS frameworks.

Refer to [Developer Guide][dev-guide] for instructions on how to configure sample React Web Application and [AWS Amplify][aws-amplify] framework.

# Native Application Developer Guide

TBD

# References

- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-provider.html
- https://aws.amazon.com/blogs/mobile/amazon-cognito-user-pools-supports-federation-with-saml/
- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-idp-settings.html
- https://aws.amazon.com/blogs/security/enabling-federation-to-aws-using-windows-active-directory-adfs-and-saml-2-0/
- http://federationworkshopreinvent2016.s3-website-us-east-1.amazonaws.com/labguides/adfshour1/labguide-adfshour1.html
- https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/deployment/best-practices-securing-ad-fs
- https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/ee892363(v=technet.10)#examples

[cognito-setup-guide]: docs/cogito-setup.md
[idp-seutp-guide]: docs/idp-setup.md
[dev-guide]: docs/dev-guide.md
[aws-wap-adfs-quickstart]: https://aws.amazon.com/quickstart/architecture/wap-adfs/
[blog1]: https://aws.amazon.com/blogs/mobile/amazon-cognito-user-pools-supports-federation-with-saml/
[aws-amplify]: https://aws.github.io/aws-amplify/media/developer_guide
[aws-amplify-appsync]: https://aws.github.io/aws-amplify/media/api_guide#working-with-graphql-endpoints

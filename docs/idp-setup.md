# Web Application Proxy Quickstart on AWS

Lets start by installing Web Application Proxy, ADFS and Domain Controllers on AWS EC2 instances. For this exercise, use the [Web Application Proxy Quickstart on AWS][aws-wap-adfs-quickstart].  Install the quick start CloudFormation template in your AWS account.

Once the installation completes, log into AWS Console and bring up EC2 dashboard.  Locate RDPGW, WAP1, ADFS1, DC1 instances.  Note down the public and private IP addresses of these instances.

```
IMPORTANT: As soon as the Web Application Proxy is installed, you will start incurring
charges.  Be mindful of the ~7 EC2 instances that this template starts and installs MS
ADFS and WAP.
```

```
IMPORTANT: When deploying the Web Application Proxy Quickstart template, make sure that
your ADFS passwords do not contain any special characters.  Keep those passwords to a
mix of alphanumeric characters and save yourself hours of pain.
```

```
IMPORTANT: The Web Application Proxy Quickstart template installation prompts for a
domain name to associate with the installation.  Make sure that it is a valid domain
name registered with your choice of DNS service providers.  We will create A Record
for this domain name to point to ADFS Web Application Proxy once the setup is complete.
```

# ADFS Setup

Follow these steps to configure ADFS:

- Connect to RDPGW public IP using Remote Desktop from your computer.
- Launch Remote Desktop inside the RDPGW and connect to the private IP address of ADFS1 instance.  This is the primary ADFS1 instance.
- Once connected to ADFS1, launch "ADFS Management" application.
- Click on `Add Relaying Party Trust`.  It will launch a wizard.  Select `Enter data manually`.  Input the following parameters:
  * Display Name: Amazon Cognito
  * Profile: ADFS Profile
  * Certificate: Skip this screen (we will add certificate later)
  * URL: `https://<domain_prefix>.auth.<region>.amazoncognito.com/saml2/idpresponse` where domain_prefix is Cognito domain in app client and region is where Cognito user pool was created.  Refer to Cognito configuration section for more details
  * Identifier: `urn:amazon:cognito:sp:<user_pool_id>` where user_pool_id is obtained from Cognito user pool configuration
  * Do not set MFA
  * Select `Permit All Users` on the last screen
- Add the following claims to `Amazon Cognito` RP (Relaying Party) created above
  * Name ID
    - Type of rule: Transform Incoming Claim
    - Incoming Claim Type: Windows Account Name
    - Outgoing Claim Type: Name ID
    - Outgoing format identified: Persistent
  * Email
    - Type of Rule: Send LDAP Attributes as Claims
    - Name of Rule: Email
    - Attribute Store: Active Directory
    - Mapping of Attributes
      * LDAP: E-Mail-Address
      * Outgoing Claim: E-Mail Address
- Launch PowerShell and type `Get-AdfsProperties` to get ADFS URL.  Note that the URL will be in this format `https://sts.<your_domain>/adfs/ls`.  Once ADFS and Cognito configuration are done, use the login URL to test ADFS login is successful.  The Login URL is `https://sts.<your_domain>/adfs/ls/idpinitiatedsignon.htm`

# Domain Controller Setup

Follow these steps to configure DC1 (primary domain controller):

- Switch back to RDPGW Remote Desktop session.
- Connect to DC1 public IP
- While in DC1, launch "Active Directory Users and Groups" application
- Create the following users by expanding `your domain` > Users.  Right click on users and create new users
  * user: bob
    - First Name: bob
    - Logon Name: bob `@your_domain`
  * user: alice
    - First Name: alice
    - Logon Name: alice `@your_domain`
- Set the password for each user on next screen
- Make sure to set the `Email` attribute in user properties screen.

# Domain Name Setup

Referring to the `Web Application Proxy Quickstart on AWS` section above, the installation assumes a resolvable domain name.  Create A Record to point the public IP address of WAP1 and WAP1.  It is normal to have two A Records created for a domain.  This is a cheap way to perform DNS based load balancing.

- Log in your DNS provider dashboard (We will assume AWS Route53)
- Create a Hosted Zone (if one doesn't exist) for your domain
- Create Record Set and add 'A Record'.  Set the value of A Record to the public IP address of WAP1
- Create another 'A Record'.  Set the value of the second A Record to the public IP address of WAP2
- Using terminal window command prompt, type `nslookup domain_name` to resolve the domain.  It should resolve to two IP addresses.


# Download idP Metadata for Cognito Configuration

Download the Metadata XML file that will be used in the following section to configure Cognito SAML Identity Provider.

- Using Chrome, navigate to `https://sts.<domain_name>/FederationMetadata/2007-06/FederationMetadata.xml`
- Inspect the downloaded file and double check it has references to `sts.<domain_name>`

# Sign out flow Setup

When `idP Sign out flow` is enabled in Cognito SAML idP setting, ADFS must be configured with Cognito signing certificate.  This is because Cognito will send a signed signout/logout SAML request to ADFS logout endpoint.  ADFS must also be configured to listen on a SAML Logout end-point where Cognito will post the signout/logout SAML request to.

### Export Cognito Signing Certificate

This can be done in two ways, using aws CLI or from Cognito dashboard.  Lets cover the CLI:

- Ensure that `aws` cli is setup with appropriate security keys for your AWS account where Cognito User Pool is created and SAML idP is configured.
- Run the following command to extract Cognito signing certificate.  This certificate contains the public key that is used by idP (ADFS) to verify the signed signout/logout SAML request Cognito sends.

   `aws cognito-idp get-signing-certificate --user-pool <your user pool id> > cognito.crt`

- Transfer the `cognito.crt` file to ADFS1 primary node.

Alternatively, the certificate is also visible in Cognito Dashboard.  Go to Federation > Identity Providers > SAML > Active SAML Providers and click on `show signing certificate`.  Copy / paste the contents into a file `cognito.crt`.

### Import Cognito Signing Certificate in ADFS

- Log into ADFS1 instance using Remote Desktop
- Make sure that the `cogito.crt` file (above) is available on the local windows file system on ADFS1
- Launch `ADFS Management` application
- Navigate to ADFS > Trust Relationships > Relaying Party Trust.  Select `Amazon Cognito` Relaying Party (or the name of your RP you created in previous steps for Cognito).  Double click on the RP to bring up its properties.
- In this Properties window, switch to `Signature` tab.
- Click `Add` button and import the `cognito.crt` signing certificate
- Once imported, double click on the certificate to bring up the Certificate Properties.  Click on `Install Certificate` button
- Choose `Local Machine` under `Store Location`.  Click `Next`.
- Select `Place certificate in following store` and click `Browse` button
- In `Select Certificate Store` dialog, choose `Trusted Root Certificate Authorities` and click `OK` button.
- Click `Next` and then `Finish` buttons to complete certificate installation.

### Disable Certificate Revocation Checks

As a precaution and in order to avoid ADFS exception `ID4037: The key needed to verify the signature could not be resolved` when Cognito triggers the idP signout flow, disable the ADFS revocation checks as follows:

- Launch Windows PowerShell in ADFS1
- List all relaying parties and revocation check settings using Windows PowerShell:
  `Get-AdfsRelyingPartyTrust | Select-Object Identifier, SigningCertificateRevocationCheck, EncryptionCertificateRevocationCheck`
- Disable Revocation Check as follows.  Note that the `Identifier URL` is visible in the previous command.  It is the identifier URL that was set in ADFS configuration earlier and is in the format `urn:amazon:cognito:sp:<user_pool_id>`
  `Get-AdfsRelyingPartyTrust -Identifier <Identifier URL> | Set-AdfsRelyingPartyTrust -SigningCertificateRevocationCheck None -EncryptionCertificateRevocationCheck None`

### Create SAML Logout Endpoint

While still in ADFS1 node

- Launch `ADFS Management` application
- Navigate to ADFS > Trust Relationships > Relaying Party Trust and choose `Amazon Cognito` RP.  Double click on it to bring its properties
- Click on the `Endpoints` tab
- Click on `Add SAML` button.
- In the Endpoint Dialog, set the following properties for the SAML Logout endpoint
  * Endpoint type: SAML Logout
  * Binding: POST
  * Trusted URL: `https://sts.<your_domain>/adfs/ls`
- Hit OK and then Apply to save changes to `Amazon Cognito` RP.

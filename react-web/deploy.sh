#!/bin/bash

#####################################################################
# WEBUI CONFIGURATION PARAMETERS
AWS_REGION="SETME"
AWS_PROFILE="default"
WEB_UI_BUCKET_NAME="SETME"
CLOUDFRONT_DISTRIBUTION_NAME="SETME"
USER_POOL_ID="SETME"
USER_POOL_CLIENT_ID="SETME"
INTERNAL_CLIENT_ID=""
COGNITO_DOMAIN_NAME="SETME"
COGNITO_SIGNIN_URL="https://SETME/redirect"
COGNITO_SIGNOUT_URL="https://SETME/redirect"
COGNITO_IDP_NAME="SETME"
COGNITO_RESOURCE_SERVER_NAME=""
COGNITO_RESOURCE_CUSTOM_SCOPE=""
# GQL_API_ENDPOINT=""
# GQL_API_ID=""

# initialize web-ui deployement parameters
WEBUI_S3_BUCKET="${WEB_UI_BUCKET_NAME}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_NAME}"
AWS_COGNITO_IDENTITY_POOL_ID=
AWS_COGNITO_USER_POOL_ID="${USER_POOL_ID}"
AWS_COGNITO_CLIENT_ID="${USER_POOL_CLIENT_ID}"
AWS_COGNITO_CLIENT_DOMAIN_NAME="${COGNITO_DOMAIN_NAME}"
AWS_COGNITO_IDP_SIGNIN_URL="${COGNITO_SIGNIN_URL}"
AWS_COGNITO_IDP_SIGNOUT_URL="${COGNITO_SIGNOUT_URL}"
AWS_COGNITO_IDP_NAME="${COGNITO_IDP_NAME}"
AWS_COGNITO_IDP_OAUTH_CLAIMS=""
# APPSYNC_GRAPHQL_ENDPOINT="${GQL_API_ENDPOINT}"



#####################################################################
# MORE PREFLIGHT CHECK
WORKING_DIR="`pwd`"
# make sure that the working directory is the root project folder
if [ ! -f "${WORKING_DIR}/package.json" -o \
     ! -f "${WORKING_DIR}/index.html" -o \
     ! -d "${WORKING_DIR}/style" -o \
     ! -d "${WORKING_DIR}/image" -o \
     ! -d "${WORKING_DIR}/src" ]; then
   echo "Error locating required files and folders.  Missing one of the following:"
   echo "    ${WORKING_DIR}/package.json"
   echo "    ${WORKING_DIR}/index.html"
   echo "    ${WORKING_DIR}/style"
   echo "    ${WORKING_DIR}/image"
   echo "    ${WORKING_DIR}/src"
   exit 1
fi


#####################################################################
# DISPLAY WEB-UI DEPLOYMENT CONFIG
echo "Web-UI Deployment Configuration"
echo
echo "  AWS_PROFILE: ${AWS_PROFILE}"
echo "  AWS_REGION: ${AWS_REGION}"
echo "  WEBUI_S3_BUCKET: ${WEBUI_S3_BUCKET}"
echo "  WORKING_DIR: ${WORKING_DIR}"
echo
echo "  AWS_COGNITO_IDENTITY_POOL_ID: ${AWS_COGNITO_IDENTITY_POOL_ID}"
echo "  AWS_COGNITO_USER_POOL_ID: ${AWS_COGNITO_USER_POOL_ID}"
echo "  AWS_COGNITO_CLIENT_ID: ${AWS_COGNITO_CLIENT_ID}"
echo "  AWS_COGNITO_CLIENT_DOMAIN_NAME: ${AWS_COGNITO_CLIENT_DOMAIN_NAME}"
echo "  AWS_COGNITO_IDP_SIGNIN_URL: ${AWS_COGNITO_IDP_SIGNIN_URL}"
echo "  AWS_COGNITO_IDP_SIGNOUT_URL: ${AWS_COGNITO_IDP_SIGNOUT_URL}"
echo "  AWS_COGNITO_IDP_NAME: ${AWS_COGNITO_IDP_NAME}"
# echo "  APPSYNC_GRAPHQL_ENDPOINT: ${APPSYNC_GRAPHQL_ENDPOINT}"
echo "  CLOUDFRONT_DISTRIBUTION_ID: ${CLOUDFRONT_DISTRIBUTION_ID}"
echo


#####################################################################
# UPDATE config.js WITH ENV SPECIFIC PARAMETERS
CONFIG_FILE="src/config.jsx"
ENV_CONFIG_FILE="src/config_env.jsx"
if [ ! -f "${CONFIG_FILE}" ]; then
    echo "Error while locating environment config file: ${CONFIG_FILE}"
    rm -rf /tmp/$$.*
    exit 2
fi

# do some stream-line editing and replace all environment specific parameters
cat "${CONFIG_FILE}" | \
    sed -e "s#\(\s*\)\(AWS_REGION:.*\)#\1AWS_REGION: '${AWS_REGION}',#g" | \
    sed -e "s#\(\s*\)\(AWS_COGNITO_IDENTITY_POOL_ID:.*\)##g" | \
    sed -e "s#\(\s*\)\(AWS_COGNITO_USER_POOL_ID:.*\)#\AWS_COGNITO_USER_POOL_ID: '${AWS_COGNITO_USER_POOL_ID}',#g" | \
    sed -e "s#\(\s*\)\(AWS_COGNITO_CLIENT_ID:.*\)#\AWS_COGNITO_CLIENT_ID: '${AWS_COGNITO_CLIENT_ID}',#g" | \
    sed -e "s#\(\s*\)\(AWS_COGNITO_CLIENT_DOMAIN_NAME:.*\)#\AWS_COGNITO_CLIENT_DOMAIN_NAME: '${AWS_COGNITO_CLIENT_DOMAIN_NAME}',#g" | \
    sed -e "s#\(\s*\)\(AWS_COGNITO_IDP_NAME:.*\)#\AWS_COGNITO_IDP_NAME: '${AWS_COGNITO_IDP_NAME}',#g" | \
    sed -e "s#\(\s*\)\(AWS_COGNITO_IDP_SIGNIN_URL:.*\)#\AWS_COGNITO_IDP_SIGNIN_URL: '${AWS_COGNITO_IDP_SIGNIN_URL}',#g" | \
    sed -e "s#\(\s*\)\(AWS_COGNITO_IDP_SIGNOUT_URL:.*\)#\AWS_COGNITO_IDP_SIGNOUT_URL: '${AWS_COGNITO_IDP_SIGNOUT_URL}',#g" | \
    sed -e "/^ *$/d" > "${ENV_CONFIG_FILE}"

# update the app config based on environment
echo "Updating application configuration..."
mv "${ENV_CONFIG_FILE}" "${CONFIG_FILE}"


#####################################################################
# BUILD WEB-UI
echo "Building application..."

# update/install npm modules
yarn install > /tmp/$$.yarn-install.log 2>&1

# copy semantic-ui-css to the /style folder
rm -rf style/semantic.min.css style/themes
cp -R node_modules/semantic-ui-css/semantic.min.css node_modules/semantic-ui-css/themes style

# run the build
yarn run build > /tmp/$$.build.log 2>&1

# check for error
if [ $? -ne 0 ]; then
    echo "Error during application build.  Build log:"
    cat /tmp/$$.build.log
    rm -rf /tmp/$$.*
    exit 3
fi


#####################################################################
# CREATE WEB-UI DEPLOYABLE ARTIFACT
echo "Preparing web contents in dist folder..."
rm -rf dist
mkdir -p dist
cp -R index.html bundle.js style image dist

# check for error
if [ $? -ne 0 ]; then
    echo "Error preparing web contents in dist folder: $?"
    rm -rf /tmp/$$.*
    exit 4
fi


#####################################################################
# COPY WEB-UI DEPLOYABLE ARTIFACT TO S3
echo "Copying dist contents to web-ui s3 bucket: ${WEBUI_S3_BUCKET}"
cd dist
aws s3 cp . "s3://${WEBUI_S3_BUCKET}" \
    --recursive \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}" > /tmp/$$.aws.s3.log 2>&1
if [ $? -ne 0 ]; then
    echo "Error during copy to s3.  aws cli log:"
    cat /tmp/$$.aws.s3.log
    rm -rf /tmp/$$.*
    exit 5
fi

exit
#####################################################################
# INVALIDATE CLOUDFRONT DISTRIBUTION CACHE
echo "Invalidating cloudfront distribution cache: ${CLOUDFRONT_DISTRIBUTION_ID}"
aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/*" \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}" > /tmp/$$.aws.cloudfront.log 2>&1
if [ $? -ne 0 ]; then
    echo "Error invalidating cloudfront distribution ${CLOUDFRONT_DISTRIBUTION_ID}.  aws cli log:"
    cat /tmp/$$.aws.cloudfront.log
    rm -rf /tmp/$$.*
    exit 6
fi


#####################################################################
# CLEANUP
echo "Cleaning up..."
cd ..
rm -rf dist
rm -rf /tmp/$$.*
echo "Done!"

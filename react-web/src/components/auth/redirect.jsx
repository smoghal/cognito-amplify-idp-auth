import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Auth, Hub } from 'aws-amplify';
import { StorageHelper } from '@aws-amplify/core';
import { Segment } from 'semantic-ui-react';
import _ from 'lodash';
import config from '../../config_dev';

const storage = new StorageHelper().getStorage();

class Redirect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accessToken: '',
      idToken: '',
      refreshToken: '',
      signedIn: false,
      errorMessage: ''
    };
    this.interval = null;

    this.validateUserSession = this.validateUserSession.bind(this);
    this.decodePayload = this.decodePayload.bind(this);
    this.calculateClockDrift = this.calculateClockDrift.bind(this);

    Hub.listen('auth', this, 'MyListener');
  }

  componentDidMount() {
    // we have previously logged in and we are being redirected again.
    // onHubCapsule() won't fire in this case. So lets invoke validateSession()

    // Firefox/Safari bug -- wait for 2+ seconds before calling validate
    // this.interval = setInterval(() => {
    //   clearInterval(this.interval);
    //   if (_.isUndefined(this.props.authenticated) || this.props.authenticated === false) {
    //     this.validateUserSession();
    //   }
    // }, 2000);

    if (_.isUndefined(this.props.authenticated) || this.props.authenticated === false) {
      this.validateUserSession();
    }
  }

  componentWillUnmount() {
    if (!_.isUndefined(this.interval) && !_.isNull(this.interval)) {
      clearInterval(this.interval);
    }
  }

  onHubCapsule(capsule) {
    console.log('onHubCapsule(): ', capsule);
    const { channel, payload } = capsule;

    if (channel === 'auth') {
      switch (payload.event) {
        case 'signIn':
          console.log('Redirect.onHubCapsule() user signed in');
          // this.validateUserSession();
          break;
        case 'signUp':
          console.log('Redirect.onHubCapsule() user signed up');
          break;
        case 'signOut':
          console.log('Redirect.onHubCapsule() user signed out');
          break;
        case 'signIn_failure':
          console.log('Redirect.onHubCapsule() user sign in failed');
          break;
      }
    }
  }

  // Updated code based on amplify-js issue #825 discussion
  // https://github.com/aws-amplify/amplify-js/issues/825
  decodePayload(jwtToken) {
    const payload = jwtToken.split('.')[1];
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    } catch (err) {
      return {};
    }
  }

  // Updated code based on amplify-js issue #825 discussion
  // https://github.com/aws-amplify/amplify-js/issues/825
  calculateClockDrift(iatAccessToken, iatIdToken) {
    const now = Math.floor(new Date() / 1000);
    const iat = Math.min(iatAccessToken, iatIdToken);
    return now - iat;
  }

  // Updated code based on amplify-js issue #825 discussion
  // https://github.com/aws-amplify/amplify-js/issues/825
  validateUserSession() {
    const {
      history,
      location
    } = this.props;

    // extract code grant from location
    const code = location.search.replace('?', '');
    const details = {
      grant_type: 'authorization_code',
      code,
      client_id: config.AWS_COGNITO_CLIENT_ID,
      redirect_uri: config.AWS_COGNITO_IDP_SIGNIN_URL
    };
    const formBody = Object.keys(details)
      .map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(details[key])}`
      )
      .join('&');

    /* eslint-disable no-undef */
    fetch('https://' + config.AWS_COGNITO_CLIENT_DOMAIN_NAME + '/oauth2/token', {
      /* eslint-enable no-undef */
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formBody
    }).then(res => {
      res.json().then(data => {
        const idTokenData = this.decodePayload(data['id_token']);
        const accessTokenData = this.decodePayload(data['access_token']);

        storage.setItem('CognitoIdentityServiceProvider.' + config.AWS_COGNITO_CLIENT_ID + '.LastAuthUser', idTokenData['cognito:username']);
        storage.setItem('CognitoIdentityServiceProvider.' + config.AWS_COGNITO_CLIENT_ID + '.' + idTokenData['cognito:username'] + '.idToken', data['id_token']);
        storage.setItem('CognitoIdentityServiceProvider.' + config.AWS_COGNITO_CLIENT_ID + '.' + idTokenData['cognito:username'] + '.accessToken', data['access_token']);
        storage.setItem('CognitoIdentityServiceProvider.' + config.AWS_COGNITO_CLIENT_ID + '.' + idTokenData['cognito:username'] + '.refreshToken', data['refresh_token']);
        storage.setItem('CognitoIdentityServiceProvider.' + config.AWS_COGNITO_CLIENT_ID + '.' + idTokenData['cognito:username'] + '.clockDrift', '' + this.calculateClockDrift(accessTokenData['iat'], idTokenData['iat']) + '');

        Auth.currentUserInfo()
          .then((res) => {
            console.log(res);
            this.setState({
              signedIn: true,
              errorMessage: '',
              accessToken: data['access_token'],
              idToken: data['id_token'],
              refreshToken: data['refresh_token']
            });

            history.push('/main', { signedIn: true, authenticated: true });
          })
          .catch((res) => {
            console.log(res);
          });
      }).catch(err2 => {
        // fire user is unauthenticated
        const errorMessage = 'user session invalid. auth required: ' + err2;

        this.setState({
          signedIn: false,
          errorMessage,
          accessToken: '',
          idToken: '',
          refreshToken: ''
        });

        console.log(errorMessage);
        history.push('/signin', { signInFailure: true, errorMessage, authenticated: false });
      });
    }).catch(err => {
      const errorMessage = JSON.stringify(err);

      this.setState({
        signedIn: false,
        errorMessage,
        accessToken: '',
        idToken: '',
        refreshToken: ''
      });

      console.error('Redirect.validateUserSession():Auth.userSession() err:', err);
      history.push('/signin', { signInFailure: true, errorMessage, authenticated: false });
    });
  }

  /*
  validateUserSession() {
    const {
      history
    } = this.props;

    Auth.currentAuthenticatedUser()
      .then(currentAuthUser => {
        console.log('Redirect.validateUserSession():Auth.currentAuthenticatedUser() currentAuthUser:', currentAuthUser);
        // grab the user session
        Auth.userSession(currentAuthUser)
          .then(session => {
            console.log('Redirect.validateUserSession():Auth.userSession() session:', session);
            // finally invoke isValid() method on session to check if auth tokens are valid
            // if tokens have expired, lets call "logout"
            // otherwise, dispatch AUTH_USER success action and by-pass login screen
            if (session.isValid()) {
              // fire user is authenticated
              console.log('user session is valid!');

              this.setState({
                signedIn: true,
                errorMessage: '',
                accessToken: session.accessToken.jwtToken,
                idToken: session.idToken.jwtToken,
                refreshToken: session.refreshToken.token
              });

              history.push('/main', { signedIn: true, authenticated: true });
            } else {
              // fire user is unauthenticated
              const errorMessage = 'user session invalid. auth required';

              this.setState({
                signedIn: false,
                errorMessage,
                accessToken: '',
                idToken: '',
                refreshToken: ''
              });

              console.log(errorMessage);
              history.push('/signin', { signInFailure: true, errorMessage, authenticated: false });
            }
          })
          .catch(err => {
            const errorMessage = JSON.stringify(err);

            this.setState({
              signedIn: false,
              errorMessage,
              accessToken: '',
              idToken: '',
              refreshToken: ''
            });

            console.error('Redirect.validateUserSession():Auth.userSession() err:', err);
            history.push('/signin', { signInFailure: true, errorMessage, authenticated: false });
          });
      })
      .catch(err => {
        const errorMessage = JSON.stringify(err);

        this.setState({
          signedIn: false,
          errorMessage,
          accessToken: '',
          idToken: '',
          refreshToken: ''
        });

        console.error('Redirect.validateUserSession():Auth.currentAuthenticatedUser() err:', err);
        history.push('/signin', { signInFailure: true, errorMessage, authenticated: false });
      });
  }
  */

  /* eslint-disable react/jsx-handler-names */
  render() {
    const {
      signedIn,
      errorMessage
    } = this.state;

    console.log('Redirect.render() state: ', this.state);
    console.log('Redirect.render() props: ', this.props);

    return (
      <Segment>
        { signedIn && !errorMessage && (
          <span>Login successful...</span>
        )}

        { !signedIn && !errorMessage && (
          <span>Please wait...</span>
        )}

        { errorMessage && (
          <span>Login error: {errorMessage}</span>
        )}
      </Segment>
    );
  }
  /* eslint-enable react/jsx-handler-names */
}

// Runtime type checking for React props
Redirect.propTypes = {
  authenticated: PropTypes.bool,
  history: PropTypes.object,
  location: PropTypes.object
};

export default Redirect;

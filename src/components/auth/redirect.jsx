import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import { Segment } from 'semantic-ui-react';
import { Hub } from 'aws-amplify';

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

    this.validateUserSession.bind(this);

    Hub.listen('auth', this, 'MyListener');
  }

  onHubCapsule(capsule) {
    console.log('onHubCapsule(): ', capsule);
    const { channel, payload } = capsule;

    if (channel === 'auth') {
      switch (payload.event) {
        case 'signIn':
          console.log('Redirect.onHubCapsule() user signed in');
          this.validateUserSession();
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

  validateUserSession() {
    const {
      history
    } = this.props;

    Auth.currentAuthenticatedUser()
      .then(currentAuthUser => {
        console.log('Signin.validateUserSession():Auth.currentAuthenticatedUser() currentAuthUser:', currentAuthUser);
        // grab the user session
        Auth.userSession(currentAuthUser)
          .then(session => {
            console.log('Signin.validateUserSession():Auth.userSession() session:', session);
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

              history.push('/main', {signedIn: true});
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
              history.push('/login', {signInFailure: true, errorMessage});
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

            console.error('actions.validateUserSession():Auth.userSession() err:', err);
            history.push('/login', {signInFailure: true, errorMessage});
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

        console.error('actions.validateUserSession():Auth.currentAuthenticatedUser() err:', err);
        history.push('/login', {signInFailure: true, errorMessage});
      });
  }

  /* eslint-disable react/jsx-handler-names */
  render() {
    const {
      signedIn,
      errorMessage
    } = this.state;

    console.log('Redirect.render() state: ', this.state);
    console.log('Redirect.render() props: ', this.props)

    return (
      <Segment>
        { signedIn && (
          <span>Login successful...</span>
        )}

        { !signedIn && (
          <span>Login error: {errorMessage}</span>
        )}

        {/* <div>
          <span>access token:</span>
          <span>{accessToken}</span>
        </div>

        <div>
          <span>id token:</span>
          <span>{idToken}</span>
        </div>

        <div>
          <span>refresh token:</span>
          <span>{refreshToken}</span>
        </div> */}

      </Segment>
    );
  }
  /* eslint-enable react/jsx-handler-names */
}

// Runtime type checking for React props
Redirect.propTypes = {
  history: PropTypes.object,
};

export default Redirect;

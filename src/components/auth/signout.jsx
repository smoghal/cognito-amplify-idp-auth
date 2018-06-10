import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import { Segment, Button } from 'semantic-ui-react';
import { Hub } from 'aws-amplify';
import config from '../../config_dev';

/**
 * This component is only called by Cognito during idP Signout flow
 * When idP signout is successful, idP invokes Cognito, which then
 * redirects to a signout callback url.  The signout callback url points
 * to this component.
 *
 * Do not directly route to /signout url or invoke this component directly.
 */
class Signout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accessToken: '',
      idToken: '',
      refreshToken: '',
      signedOut: false
    };

    this.signIn.bind(this);
    this.signOut.bind(this);
    Hub.listen('auth', this, 'MyListener');
  }

  onHubCapsule(capsule) {
    console.log('onHubCapsule(): ', capsule);
    const { channel, payload } = capsule;

    if (channel === 'auth') {
      switch (payload.event) {
        case 'signIn':
          console.log('Signout.onHubCapsule() user signed in');
          break;
        case 'signUp':
          console.log('Signout.onHubCapsule() user signed up');
          break;
        case 'signOut':
          console.log('Signout.onHubCapsule() user signed out');
          this.setState({signedOut: true});
          break;
        case 'signIn_failure':
          console.log('Signout.onHubCapsule() user sign in failed');
          break;
      }
    }
  }

  signIn() {
    const authConfig = Auth.configure();
    const {
      domain,
      redirectSignIn,
      responseType } = authConfig.oauth;

    const clientId = config.userPoolWebClientId;
    const url = `https://${domain}/oauth2/authorize?identity_provider=${config.AWS_COGNITO_IDP_NAME}&redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;

    console.log('onSignIn() sign url: ', url);
    // Launch hosted UI
    window.location.assign(url);
  }

  signOut() {
    Auth.signOut()
      .then( data => {
        console.log('Signout.signOut():Auth.signOut() data:', data);

        //history.push('/');
        this.setState({signedOut: true});

      })
      .catch(err => {
        console.error('Signout.signOut():Auth.signOut() err:', err);
        this.setState({signedOut: false});
      });
  }

  /* eslint-disable react/jsx-handler-names */
  render() {
    const {
      accessToken,
      idToken,
      refreshToken,
      signedOut
    } = this.state;

    console.log('Signout.render() state: ', this.state);
    console.log('Signout.render() props: ', this.props)

    return (
      <Segment>
        { signedOut && (
          <div>
            <span>Signout successful.  Sign in again?</span>
            <Button
              content="Sign In"
              onClick={this.signIn} />
          </div>
        )}

        { !signedOut && (
          <div>
            <span>Signout unsuccessful.  Sign out again?</span>
            <Button
              content="Sign out"
              onClick={this.signOut} />
          </div>
        )}

        <div>
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
        </div>
      </Segment>
    );
  }
  /* eslint-enable react/jsx-handler-names */
}

// Runtime type checking for React props
Signout.propTypes = {
  history: PropTypes.object,
  errorMessage: PropTypes.string
};

export default Signout;

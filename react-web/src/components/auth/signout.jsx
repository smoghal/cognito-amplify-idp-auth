import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import { Segment, Button } from 'semantic-ui-react';
import config from '../../config';

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

    this.signIn.bind(this);
    this.signOut.bind(this);
  }

  signIn() {
    const authConfig = Auth.configure();
    const {
      domain,
      redirectSignIn,
      redirectSignOut,
      responseType } = authConfig.oauth;

    const clientId = config.AWS_COGNITO_CLIENT_ID;
    const url = `https://${domain}/oauth2/authorize?identity_provider=${config.AWS_COGNITO_IDP_NAME}&redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;

    console.log('Signout.signIn() sign url: ', url);
    // Launch hosted UI
    window.location.assign(url);
  }

  signOut() {
    console.log('Main.signout()');

    Auth.signOut()
      .then(data => {
        console.log('Signout.signOut():Auth.signOut() data:', data);

        // history.push('/', {signInFailure: false, errorMessage: '', authenticated: false});
      })
      .catch(err => {
        console.error('Signout.signOut():Auth.signOut() err:', err);
      });
  }

  /* eslint-disable react/jsx-handler-names */
  render() {
    const {
      authenticated
    } = this.props;

    console.log('Signout.render() state: ', this.state);
    console.log('Signout.render() props: ', this.props);

    return (
      <Segment>
        { !authenticated && (
          <div>
            <span>Signout successful.  Sign in again?</span>
            <Button
              content="Sign In"
              onClick={this.signIn} />
          </div>
        )}

        { authenticated && (
          <div>
            <span>Signout unsuccessful.  Sign out again?</span>
            <Button
              content="Sign out"
              onClick={this.signOut} />
          </div>
        )}

      </Segment>
    );
  }
  /* eslint-enable react/jsx-handler-names */
}

// Runtime type checking for React props
Signout.propTypes = {
  authenticated: PropTypes.bool
};

export default Signout;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Auth} from 'aws-amplify';
import { Segment, Button } from 'semantic-ui-react';
import _ from 'lodash';
import config from '../../config_dev';

class Signin extends Component {

  constructor(props) {
    super(props);

    this.signIn.bind(this);
  }

  componentDidMount() {
    const { signInFailure } = this.props;

    if (_.isUndefined(signInFailure) || _.isNull(signInFailure) ) {
      console.log('Signin.componentDidMount(): redirecting to cognito signin');
      // this.signIn();
    } else {
      console.log('Signin.componentDidMount(): show Login again button');
    }
  }

  signIn() {
    const authConfig = Auth.configure();
    const {
      domain,
      redirectSignIn,
      redirectSignOut,
      responseType } = authConfig.oauth;

    const clientId = config.userPoolWebClientId;
    const url = `https://${domain}/oauth2/authorize?identity_provider=${config.AWS_COGNITO_IDP_NAME}&redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;

    console.log('onSignIn() sign url: ', url);
    // Launch hosted UI
    window.location.assign(url);
  }

  /* eslint-disable react/jsx-handler-names */
  render() {
    const {
      signInFailure,
      errorMessage
    } = this.props;

    console.log('Signin.render() state: ', this.state);
    console.log('Signin.render() props: ', this.props)

    return (
      <Segment>
        { !signInFailure && (
          <span>Redirecting to idP login screen...</span>
        )}

        { signInFailure && (
          <div>
            <span>There was an error during sign in.  Error: {errorMessage}</span>
            <span>Sign in again?</span>
            <Button
              content="Signin"
              onClick={this.signIn} />
          </div>
        )}

      </Segment>
    );
  }
  /* eslint-enable react/jsx-handler-names */
}

// Runtime type checking for React props
Signin.propTypes = {
  signInFailure: PropTypes.bool,
  errorMessage: PropTypes.string
};

export default Signin;

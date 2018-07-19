import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import { Segment, Header, Label, Button } from 'semantic-ui-react';
import _ from 'lodash';

class Welcome extends Component {

  constructor(props) {
    super(props);

    this.state = {
      accessToken: '',
      idToken: '',
      refreshToken: '',
      sessionIdleTime: 0,
      validating: false
    };

    this.validateUserSession.bind(this);
    this.dumpToken.bind(this);
    this.handleClick.bind(this);
    this.startSessionIdleCount.bind(this);
    this.handleUpdateAttributes.bind(this);
  }

  componentDidMount() {

    // we have previously logged in and we are being redirected again.
    // onHubCapsule() won't fire in this case. So lets invoke validateSession()
    if (_.isUndefined(this.props.authenticated) || this.props.authenticated == false) {
      this.validateUserSession();
    }

    //this.startSessionIdleCount();
  }

  componentWillUnmount() {
    if (!_.isUndefined(this.interval)) {
      clearInterval(this.interval);
    }
  }

  startSessionIdleCount(startTime) {
    if (!_.isUndefined(this.interval)) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.setState({ sessionIdleTime: (Math.round((Date.now() - startTime) / 1000) / 60).toFixed(1) })
    }, 1000);
  }

  validateUserSession() {
    const {
      history
    } = this.props;

    Auth.currentAuthenticatedUser()
      .then(currentAuthUser => {
        console.log('Welcome.validateUserSession():Auth.currentAuthenticatedUser() currentAuthUser:', currentAuthUser);
        // grab the user session
        Auth.userSession(currentAuthUser)
          .then(session => {
            console.log('Welcome.validateUserSession():Auth.userSession() session:', session);
            // finally invoke isValid() method on session to check if auth tokens are valid
            // if tokens have expired, lets call "logout"
            // otherwise, dispatch AUTH_USER success action and by-pass login screen
            if (session.isValid()) {
              // fire user is authenticated
              console.log('user session is valid!');

              this.setState({
                accessToken: session.accessToken,
                idToken: session.idToken,
                refreshToken: session.refreshToken,
                validating: false
              });

              // when state properties are updated, render() is called automatically
              // we don't need to do anything else here.

              // lets start idle timer count
              // start time is retrieved from iat claim
              // iat = time when token was issued
              const startTime = session.accessToken.payload.iat * 1000;

              this.startSessionIdleCount(startTime);
            } else {
              // fire user is unauthenticated
              const errorMessage = 'user session invalid. auth required';

              this.setState({
                accessToken: '',
                idToken: '',
                refreshToken: '',
                sessionIdleTime: 0,
                validating: false
              });

              console.log(errorMessage);
              history.push('/signin', {signInFailure: true, errorMessage, authenticated: false});
            }
          })
          .catch(err => {
            const errorMessage = JSON.stringify(err);

            this.setState({
              accessToken: '',
              idToken: '',
              refreshToken: '',
              sessionIdleTime: 0,
              validating: false
            });

            console.error('Welcome.validateUserSession():Auth.userSession() err:', err);
            history.push('/signin', {signInFailure: true, errorMessage, authenticated: false});
          });
      })
      .catch(err => {
        const errorMessage = JSON.stringify(err);

        this.setState({
          accessToken: '',
          idToken: '',
          refreshToken: '',
          sessionIdleTime: 0,
          validating: false
        });

        console.error('Welcome.validateUserSession():Auth.currentAuthenticatedUser() err:', err);
        history.push('/signin', {signInFailure: true, errorMessage, authenticated: false});
      });
  }

  dumpToken(token) {
    if (_.isNull(token) || _.isUndefined(token)) {
      return null;
    }

    const jsxElems = Object.keys(token).map((objKey, objIndex) => (
      <div key={objIndex}>
        <Label>{objKey}</Label>
        <Label basic size="small">{JSON.stringify(token[objKey])}</Label>
      </div>
    ));

    return jsxElems;
  }

  handleClick(event) {
    console.log('Welcome.handleClick() called', event);
    this.setState({validating: true});
    // simulate the in-button loading spinner before calling validateUserSession()
    this.validateUserSession();
  }

  handleUpdateAttributes(event) {
    console.log('Welcome.handleUpdateAttributes() called', event);
    Auth.currentAuthenticatedUser()
      .then(user => {
        console.log('Welcome.handleUpdateAttributes() Auth.currentAuthenticatedUser() result:', user);

        Auth.updateUserAttributes(user, {'custom:is_admin': '0'})
          .then(result => {
            console.log('Welcome.handleUpdateAttributes() Auth.updateUserAttributes result:', result);
          })
          .catch(err => {
            console.log('Welcome.handleUpdateAttributes() Auth.updateUserAttributes error:', err);
          });
      })
      .catch(err => {
        console.log('Welcome.handleUpdateAttributes() Auth.currentAuthenticatedUser() error:', err);
      });

  }

  /* eslint-disable react/jsx-handler-names */
  render() {
    const {
      sessionIdleTime,
      idToken,
      accessToken,
      validating
    } = this.state;

    return (
      <div>
        <Segment basic textAlign="center" className="welcome-page">

          <Segment basic clearing className="welcome-header">
            <Header as="h4" floated="left">
              Session Idle Time: {sessionIdleTime} m
            </Header>
            <Header as="h4" floated="right" className="welcome-header-right">
              {validating && (
                <Button loading>Please Wait</Button>
              )}
              {!validating && (
                <Button onClick={e => (this.handleClick(e))}>Validate Session</Button>
              )}
              <Button onClick={e => (this.handleUpdateAttributes(e))}>Update Custom Attribute</Button>

            </Header>
          </Segment>

          <Segment.Group horizontal>
            <Segment className="segment-left">
              <Label attached="top">ID Token</Label>
              {this.dumpToken(idToken.payload)}
            </Segment>
            <Segment className="segment-right">
              <Label attached="top">Access Token</Label>
              {this.dumpToken(accessToken.payload)}
            </Segment>
          </Segment.Group>
        </Segment>
      </div>
    );
  }
}

// Runtime type checking for React props
Welcome.propTypes = {
  authenticated: PropTypes.bool,
  history: PropTypes.object
};

export default Welcome;

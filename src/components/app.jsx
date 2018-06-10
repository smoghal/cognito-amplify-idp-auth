import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';

import SignIn from './auth/signin';
import SignOut from './auth/signout';
import CognitoRedirect from './auth/redirect';
import Main from './main';

const PublicRoute = ({ component: ReactComponent, authStatus, ...rest}) => (
  <Route {...rest} render={props => typeof authStatus === 'undefined' || authStatus == false ?
    ( <ReactComponent {...props} /> ) : (<Redirect to="/main" />)
  } />
);

const PrivateRoute = ({ component: ReactComponent, authStatus, ...rest}) => (
  <Route {...rest} render={props => typeof authStatus === 'undefined' || authStatus == false ?
    ( <Redirect to="/signin" /> ) : ( <ReactComponent {...props} /> )
  } />
);

const DefaultRoute = ({ authStatus, ...rest}) => {
  console.log('App.DefaultRoute() authStatus:', authStatus)
  return (
    <Route {...rest} render={props => typeof authStatus === 'undefined' || authStatus == false ?
      ( <Redirect to="/signin" /> ) : ( <Redirect to="/main" /> )
    } />
  );
}

class App extends Component {

  constructor(props) {
    super(props);
    this.handleWindowClose = this.handleWindowClose.bind(this);
  }

  /* eslint-disable camelcase */
  UNSAFE_componentWillMount() {
    console.log('App.componentWillMount() props: ', this.props);
    window.addEventListener('beforeunload', this.handleWindowClose);
  }

  UNSAFE_componentWillUnMount() {
    window.removeEventListener('beforeunload', this.handleWindowClose);
  }
  /* eslint-enable camelcase */

  handleWindowClose = async e => {
    e.preventDefault();
  }

  render() {

    console.log('App.render() props: ', this.props);

    return (
      <Router>
        <Switch>

          <DefaultRoute exact path="/" authStatus={this.props.authenticated} />
          <PublicRoute exact path="/redirect" component={CognitoRedirect} />
          <PublicRoute exact path="/signin" component={SignIn} authStatus={this.props.authenticated} />
          <PublicRoute exact path="/signout" component={SignOut} authStatus={this.props.authenticated} />
          <PrivateRoute exact path="/main" component={Main} authStatus={this.props.authenticated} />

        </Switch>
      </Router>
    );
  }
}

// Runtime type checking for React props
App.propTypes = {
  history: PropTypes.object
};

export default App;

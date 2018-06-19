import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import _ from 'lodash';

import SignIn from './auth/signin';
import SignOut from './auth/signout';
import CognitoRedirect from './auth/redirect';
import Main from './main';

const PublicRoute = ({ component: ReactComponent, ...rest}) => {
  const authStatus = _.has(rest, 'location.state.authenticated', false) ? rest.location.state.authenticated : false;

  console.log('App.PublicRoute() authStatus:', authStatus)
  return (
    <Route {...rest} render={props => typeof authStatus === 'undefined' || authStatus == false ?
      ( <ReactComponent {...props} authenticated={authStatus} /> ) : (<Redirect to="/main" authenticated={authStatus} />)
    } />
  );
};

const PrivateRoute = ({ component: ReactComponent, ...rest}) => {
  const authStatus = _.get(rest, 'location.state.authenticated', false) ? rest.location.state.authenticated : false;

  console.log('App.PrivateRoute() authStatus:', authStatus);
  return (
    <Route {...rest} render={props => typeof authStatus === 'undefined' || authStatus == false ?
      ( <Redirect to="/signin" authenticated={authStatus} /> ) : ( <ReactComponent {...props} authenticated={authStatus} /> )
    } />
  );
};

const DefaultRoute = ({ ...rest}) => {
  const authStatus = _.get(rest, 'location.state.authenticated', false) ? rest.location.state.authenticated : false;

  console.log('App.DefaultRoute() authStatus:', authStatus);
  return (
    <Route {...rest} render={props => typeof authStatus === 'undefined' || authStatus == false ?
      ( <Redirect to="/signin" authenticated={authStatus} /> ) : ( <Redirect to="/main" authenticated={authStatus} /> )
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

  handleSignin() {
    console.log('App.handleSignin()');
  }

  handleSignout() {
    console.log('App.handleSignout()');
  }

  render() {

    console.log('App.render() state: ', this.state);
    console.log('App.render() props: ', this.props);

    return (
      <Router>
        <Switch>

          <DefaultRoute exact path="/" />
          <PublicRoute exact path="/redirect" component={CognitoRedirect} />
          <PublicRoute exact path="/signin" component={SignIn} />
          <PublicRoute exact path="/signout" component={SignOut} />
          <PrivateRoute exact path="/main" component={Main} />

        </Switch>
      </Router>
    );
  }
}

export default App;

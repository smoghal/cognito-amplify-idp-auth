import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import {  Sidebar, Menu, Segment, Label } from 'semantic-ui-react';

const WelcomeScreen = () => (
  <Segment basic textAlign="center" className="welcome-page">
    <Label basic size="large">Welcome</Label>
    <p>Super secret contents</p>
  </Segment>
);

// Custom Route component that passes a property ('mode') to the routed component
const RouteWithProps = ({ component: ReactComponent, mode, ...rest}) => {
  console.log('Main.RouteWithProps() mode:', mode)
  return (
    <Route {...rest} render={props => ( <ReactComponent mode={mode} {...props} /> )} />
  );
}

class Main extends Component {
  constructor(props) {
    super(props);

    console.log('Main.constructor():');

    this.state = {
      visible: true,
      signedOut: false
    };

    this.signOut = this.signOut.bind(this);
  }

  signOut() {
    console.log('Main.signout()');
    const {
      history
    } = this.props;

    Auth.signOut()
      .then( data => {
        console.log('Main.signOut():Auth.signOut() data:', data);

        this.setState({signedOut: true});
        //history.push('/', {signInFailure: false, errorMessage: '', authenticated: false});
      })
      .catch(err => {
        console.error('Main.signOut():Auth.signOut() err:', err);
        this.setState({signedOut: false});
      });
  }

  /* eslint-disable react/jsx-handler-names */
  render() {
    const { visible } = this.state || {};

    console.log('Main.render() state', this.state);
    console.log('Main.render() props', this.props);

    return (
      <div className="main">
        <Router>
          <Sidebar.Pushable as={Segment}>
            <Sidebar as={Menu} width="thin" visible={visible} vertical>
              <Menu.Item name="home">
                Home
              </Menu.Item>
              <Menu.Item name="page1" link>
                <Link to="/main/page1" className="menu-text">Page1</Link>
              </Menu.Item>
              <Menu.Item name="page2">
                <Link to="/main/page2" className="menu-text">Page2</Link>
              </Menu.Item>
              <Menu.Item name="logout" onClick={this.signOut}>
                Logout
              </Menu.Item>
            </Sidebar>
            <Sidebar.Pusher>
              <Segment basic>
                <Switch>
                  <Route exact path="/main" component={WelcomeScreen} />
                  <Route exact path="/main/page1" component={WelcomeScreen} />
                  <RouteWithProps exact path="/main/page1/stuff" component={WelcomeScreen} mode="parameter1" />
                  <Route exact path="/main/page2" component={WelcomeScreen} />
                  <RouteWithProps exact path="/main/page2/stuff" component={WelcomeScreen} mode="parameter2" />
                </Switch>
              </Segment>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </Router>
      </div>
    );
  }
  /* eslint-enable react/jsx-handler-names */
}

// Runtime type checking for React props
Main.propTypes = {
  signedIn: PropTypes.bool,
  history: PropTypes.object
}

export default Main;

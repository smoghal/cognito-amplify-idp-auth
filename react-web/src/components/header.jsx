import React from 'react';
import { Header } from 'semantic-ui-react';

const AppHeader = () => (
  <div className="header-page">
    <Header attached="top" textAlign="center">
      <div className="nav-logo">&nbsp;</div>
      Cognito Userpool idP Auth
    </Header>
  </div>
);

export default AppHeader;

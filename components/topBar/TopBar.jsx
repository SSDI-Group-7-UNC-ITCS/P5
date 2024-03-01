import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './TopBar.css';
import FetchModel from '../../lib/fetchModelData';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app_info: null,
    };
  }

  componentDidMount() {
    this.handleAppInfoChange();
  }

  handleAppInfoChange() {
    const app_info = this.state.app_info;
    if (app_info === null) {
      FetchModel('/test/info')
        .then((response) => {
          this.setState({
            app_info: response.data,
          });
        })
        .catch((error) => {
          console.error('Error fetching app info:', error);
        });
    }
  }

  render() {
    const toolbarStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90%',
    };

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar style={toolbarStyle}>
          <Typography variant="h5" color="white">
            Team 7
          </Typography>
          <Typography variant="h6" color="white">
            {this.props.topName}
          </Typography>
          {this.state.app_info && (
            <Typography variant="h5" component="div" color="inherit">
              Version: {this.state.app_info.__v}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
import React, { Component } from 'react';
import {
  Button,
  Box,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import './loginRegister.css';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

class LoginRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: '',
        last_name: '',
        location: '',
        description: '',
        occupation: '',
        login_name: '',
        password: '',
        password_repeat: ''
      },
      showLoginError: false,
      showRegistrationError: false,
      showRegistrationSuccess: false,
      showRegistration: false,
      showRequiredFieldsWarning: false
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleShowRegistration = this.handleShowRegistration.bind(this);
  }

  handleShowRegistration() {
    this.setState(prevState => ({
      showRegistration: !prevState.showRegistration,
      showRegistrationError: false,
      showRequiredFieldsWarning: false
    }));
  }

  handleLogin() {
    const currentState = JSON.stringify(this.state.user);
    axios.post(
      "/admin/login",
      currentState,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then((response) => {
        const user = response.data;
        this.setState({
          showLoginError: false,
          showRegistrationSuccess: false,
          showRegistrationError: false,
        });
        this.props.changeUser(user);
      })
      .catch(error => {
        this.setState({
          showLoginError: true,
          showRegistrationSuccess: false,
          showRegistrationError: false,
        });
        console.log(error);
      });
  }

  handleRegister() {
    if (this.state.user.password !== this.state.user.password_repeat) {
      return;
    }
    const requiredFields = ['login_name', 'password', 'password_repeat', 'first_name', 'last_name'];
    if (requiredFields.some(field => !this.state.user[field])) {
      this.setState({ showRequiredFieldsWarning: true });
      return;
    }

    const currentState = JSON.stringify(this.state.user);
    axios.post(
      "/user/",
      currentState,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then((response) => {
        const user = response.data;
        this.setState({
          showRegistrationSuccess: true,
          showRegistrationError: false,
          showLoginError: false,
          showRegistration: false
        });
        this.props.changeUser(user);
      })
      .catch(error => {
        this.setState({
          showRegistrationError: true,
          showLoginError: false,
          showRegistrationSuccess: false,
        });
        console.log(error);
      });
  }

  handleChange(event) {
    const { id, value } = event.target;
    this.setState(prevState => ({
      user: {
        ...prevState.user,
        [id]: value
      }
    }));
  }

  render() {
    return (
      <div>
        <Box component="form" autoComplete="off">
          {this.state.showLoginError && <Alert severity="error">Login Failed</Alert>}
          {this.state.showRegistrationError && <Alert severity="error">Registration Failed</Alert>}
          {this.state.showRegistrationSuccess && <Alert severity="success">Registration Succeeded</Alert>}
          <div>
            <TextField id="login_name" label="Login Name" variant="outlined" fullWidth
              margin="normal" required={true} onChange={this.handleChange} />
          </div>
          <div>
            <TextField id="password" label="Password" variant="outlined" fullWidth
              margin="normal" type="password" required={true} onChange={this.handleChange} />
          </div>
          <Box mb={2}>
            <Button type="submit" variant="contained" onClick={this.handleLogin}>
              Login
            </Button>
          </Box>
          <Accordion expanded={this.state.showRegistration} onChange={this.handleShowRegistration}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>User Registration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <div>
                  <TextField id="password_repeat" label="Repeat Password" variant="outlined" fullWidth
                    margin="normal" type="password" required={this.state.showRegistration} onChange={this.handleChange} />
                </div>
                <div>
                  <TextField id="first_name" label="First Name" variant="outlined" fullWidth
                    margin="normal" autoComplete="off" required={this.state.showRegistration} onChange={this.handleChange} />
                </div>
                <div>
                  <TextField id="last_name" label="Last Name" variant="outlined" fullWidth
                    margin="normal" required={this.state.showRegistration} onChange={this.handleChange} />
                </div>
                <div>
                  <TextField id="location" label="Location" variant="outlined" fullWidth
                    margin="normal" onChange={this.handleChange} />
                </div>
                <div>
                  <TextField id="description" label="Description" variant="outlined" multiline rows={4}
                    fullWidth margin="normal" onChange={this.handleChange} />
                </div>
                <div>
                  <TextField id="occupation" label="Occupation" variant="outlined" fullWidth
                    margin="normal" onChange={this.handleChange} />
                </div>
                <div>
                  <Button variant="contained" onClick={this.handleRegister}>
                    Register Me
                  </Button>
                </div>
              </Box>
            </AccordionDetails>
          </Accordion>
          {this.state.showRequiredFieldsWarning && <Alert severity="warning">Please fill in all required fields.</Alert>}
        </Box>
      </div>
    );
  }

}

export default LoginRegister;

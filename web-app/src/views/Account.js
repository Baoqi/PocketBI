
import React from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import Modal from '../components/Modal/Modal';

class Account extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showUpdatePassword: false,
      id: null,
      username: '',
      name: '',
      sysRole: '',
      password: '',
      confirmedPassword: ''
    };
  }

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  componentDidMount() {
    this.fetchUser();
  }

  fetchUser = () => {
    axios.get('/ws/users/account')
      .then(res => {
        const user = res.data;
        this.setState({
          id: user.id,
          username: user.username,
          name: user.name,
          sysRole: user.sysRole
        });
      });
  }

  save = () => {
    const {
      showUpdatePassword,
      name,
      password,
      confirmedPassword
    } = this.state;

    const user = {
      name: name
    }

    if (showUpdatePassword) {
      if (password !== confirmedPassword) {
        toast.error(`Those passwords didn't match.`);
        return;
      }  

      if (password.length < 8) {
        toast.error(`Use 8 or more characters for password.`);
        return;
      }

      user.password = password;
    }

    axios.put('/ws/users/account', user)
      .then(res => {
        toast.success('Saved.');
      });
  }

  toggleUpdatePassword = () => {
    this.setState(prevState => ({
      showUpdatePassword: !prevState.showUpdatePassword
    })); 
  }

  render() {
    const { t } = this.props;

    const {
      showUpdatePassword,
      username,
      sysRole
    } = this.state;

    return (
      <div className="full-page-content">
        <div className="form-panel" style={{width: '400px'}}>   
          <label>{t('Username')}</label>
          <div className="form-input bg-grey">{username}</div>

          <label>{t('Name')}</label>
          <input 
            className="form-input"
            type="text"   
            name="name" 
            value={this.state.name}
            onChange={this.handleInputChange} />
          <br/>

          <label>{t('System Role')}</label>
          <div className="form-input bg-grey">{sysRole}</div>

          <hr />

          <button className="button mt-3" onClick={this.toggleUpdatePassword}>{t('Change Password')}</button>
          {
            showUpdatePassword && (
              <div style={{marginTop: '8px'}}>
                <label>{t('New Password')}</label>
                <input 
                  className="form-input"
                  type="password" 
                  name="password" 
                  value={this.state.password}
                  onChange={this.handleInputChange} />
                <label>{t('Confirm Password')}</label>
                <input 
                  className="form-input"
                  type="password" 
                  name="confirmedPassword" 
                  value={this.state.confirmedPassword}
                  onChange={this.handleInputChange} />
              </div>
          )}

          <hr />
          <button className="button mt-10 button-green" onClick={this.save}>
            <FontAwesomeIcon icon="save"  fixedWidth /> {t('Save')}
          </button>
        </div>

      </div>
    )
  }
}

export default (withTranslation()(Account));
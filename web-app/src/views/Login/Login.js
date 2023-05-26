import React from 'react';
import ReactDOM from 'react-dom';
import { withRouter } from '../../components/routing/RouterUtil';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import './Login.css';
import {client} from "../../api/PocketBaseApi";

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    componentDidMount() {
        const thisNode = ReactDOM.findDOMNode(this);
        if (thisNode) {
            const { ownerDocument } = thisNode;
            ownerDocument.addEventListener("keydown", this.onKeyDown);
        }
    }

    componentWillUnmount() {
        const thisNode = ReactDOM.findDOMNode(this);
        if (thisNode) {
            const { ownerDocument } = thisNode;
            ownerDocument.removeEventListener('keydown', this.onKeyDown);
        }
    }

    handleCheckBoxChange = (name, isChecked) => {
        this.setState({
            [name]: isChecked
        });
    }

    handleInputChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onKeyDown = (event) => {
        if(event.keyCode === 13) {
            this.login();
        }
    }

    login = () => {
        const {
            username,
            password
        } = this.state;

        if (!username) {
            toast.error('Enter username');
            return;
        }

        if (!password) {
            toast.error('Enter password');
            return;
        }

        client.collection('users').authWithPassword(username, password)
            .then(res => {
                if (res.token) {
                    this.props.onLoginSuccess(res);
                } else {
                    toast.error(res.message);
                }
            })
            .catch(err => {
                toast.error(err.message);
            });
    }

    render() {
        const { t } = this.props;

        return (
            <div className="login-view">
                <div className="login-panel">
                    <div className="login-app-title">{t('PocketBI')}</div>
                    <div className="login-panel-body">
                        <div className="form-panel">
                            <label>{t('Username')}</label>
                            <input
                                className="form-input login-input"
                                type="text"
                                name="username"
                                value={this.state.username}
                                onChange={this.handleInputChange}
                            />
                            <label>{t('Password')}</label>
                            <input
                                className="form-input login-input"
                                type="password"
                                name="password"
                                value={this.state.password}
                                onChange={this.handleInputChange}
                            />
                            <button className="button login-button button-green"onClick={this.login}>{t('Login')}</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default (withTranslation()(withRouter(Login)));
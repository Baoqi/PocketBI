import React from 'react';
import {Navigate, Route, Routes} from "react-router-dom";
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { withRouter } from "./components/routing/RouterUtil";
import { 
  faChalkboard, faDatabase, faUsersCog, faPlus, faTimes,
  faEdit, faTrashAlt, faPlayCircle, faStopCircle, faRedoAlt,
  faTv, faPlug, faUser, faSignOutAlt, faCompress, faExpandArrowsAlt,
  faFileExport, faFileCsv, faCircleNotch, faSearch, faSave, 
  faCalendarPlus, faFilter, faExternalLinkAlt, faCheckSquare, 
  faLongArrowAltRight, faWrench, faArchive, faFileDownload,
  faHeart, faShareSquare, faSearchLocation, faClipboard, 
  faAngleRight, faAngleDown, faFilePdf, faEllipsisH, faBolt, faAngleLeft, 
  faChevronRight, faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import {
  faSquare as farSquare,
  faHeart as farHeart
} from '@fortawesome/free-regular-svg-icons';
import { withTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';


import './App.css';

import Workspace from './views/Workspace';
import PageNotFound from './views/PageNotFound';
import Login from './views/Login/Login';
import * as Util from './api/Util';
import {client} from "./api/PocketBaseApi";


library.add(faChalkboard, faDatabase, faUsersCog, faPlus, faTimes, 
  faEdit, faTrashAlt, faPlayCircle, faStopCircle, faRedoAlt, 
  faTv, faPlug, faUser, faSignOutAlt, faCompress, faExpandArrowsAlt,
  faFileExport, faFileCsv, faCircleNotch, faSearch, faSave, 
  faCalendarPlus, faFilter, faExternalLinkAlt, faCheckSquare,
  faLongArrowAltRight, faWrench, farSquare, faArchive, faFileDownload,
  faHeart, farHeart, faShareSquare, faSearchLocation, faClipboard,
  faAngleRight, faAngleDown, faFilePdf, faEllipsisH, faBolt, faAngleLeft,
  faChevronRight, faChevronLeft
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localeLanguage: ''
    }
  }

  componentDidMount() {
    this.configPocketBaseApi();
    this.configAxiosInterceptors();
    this.configAxiosAuthHeader();
    this.configLocaleLanguage();
  }

  onLoginSuccess = (loginResponse = {}) => {
    let directUrl = '/workspace/report';
    this.configAxiosAuthHeader();
    this.props.navigate(directUrl);
  }

  onLogout = () => {
    client.authStore.clear();
    this.props.navigate('/login');
  }

  configAxiosInterceptors = () => {
    axios.defaults.baseURL = 'https://pocketapp.fly.dev/';

    axios.interceptors.response.use((response) => {
        return response;
      }, (error) => {
        const readableServerError = Util.toReadableServerError(error);
        toast.error(() => <div className="toast-msg-body">{readableServerError}</div>);
        return Promise.reject(error);
    });
  }

  configAxiosAuthHeader = () => {
    if (client.authStore.isValid) {
      // currently only admin is supported
      axios.defaults.headers.common['Authorization'] = `Admin ${client.authStore.token}`;
    }
  }

  configPocketBaseApi = () => {
    client.afterSend = (response, data) => {
      if (response.status === 403) {
        this.props.navigate('/login');
        return null;
      }
      return data;
    }
  }

  configLocaleLanguage = () => {
    const {
      localeLanguage
    } = this.state;
    if (localeLanguage) {
      return;
    }

    /*
    axios.get('/info/general')
      .then(res => {
        const info = res.data;
        const {
          localeLanguage
        } = info;
        const { i18n } = this.props;
        i18n.changeLanguage(String(localeLanguage));
        this.setState({
          localeLanguage: localeLanguage
        });
      });
     */
  }
   
  render() {
    return (
      <div className="app">
        <Routes>
          <Route exact path="/" element={<Navigate replace to='/workspace/report' />} />
          <Route path="login" element={<Login onLoginSuccess={this.onLoginSuccess} />} />
          <Route path="workspace/*" element={
            <Workspace onLogout={this.onLogout} />
          } />
          <Route element={<PageNotFound />} />
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          draggable={false}
          hideProgressBar
          closeOnClick
        />
      </div>
    );
  }
}

export default (withTranslation()(withRouter(App)));

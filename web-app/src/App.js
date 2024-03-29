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
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.min.css';


import './App.css';

import Workspace from './views/Workspace';
import PageNotFound from './views/PageNotFound';
import Login from './views/Login/Login';
import * as Util from './api/Util';
import {client, PB_BASE_URL} from "./api/PocketBaseApi";
import ReportFullScreenView from "./views/ReportFullScreenView";
import VizChatView from "./views/VizChatView";


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
    axios.defaults.baseURL = PB_BASE_URL;

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
      axios.defaults.headers.common['Authorization'] = `${client.authStore.token}`;
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

    const { i18n } = this.props;
    let languageToUse = localStorage.getItem('localeLanguage');
    if (!languageToUse) {
      languageToUse = navigator.language || navigator.userLanguage;
    }

    if (languageToUse) {
      i18n.changeLanguage(languageToUse);
      this.setState({
        localeLanguage: languageToUse
      });
    }
  }

  render() {
    return (
      <div className="app">
        <Routes>
          <Route exact path="/" element={<Navigate replace to='/workspace/report' />} />
          <Route path="login" element={<Login onLoginSuccess={this.onLoginSuccess} />} />
          <Route path="workspace/*" element={
              client.authStore.isValid ?
                  (<Workspace onLogout={this.onLogout} />) :
                  (<Navigate replace to='/login' />)
          } />
          <Route exact path="shared_report" element={<ReportFullScreenView />} />
          <Route exact path="chat" element={<VizChatView />} />
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

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
import * as Util from './api/Util';


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
    this.configAxiosInterceptors();
    this.configLocaleLanguage();
  }

  configAxiosInterceptors = () => {
    axios.defaults.baseURL = 'http://bwu.guandata.com:6688/';

    axios.interceptors.response.use((response) => {
        return response;
      }, (error) => {
        const readableServerError = Util.toReadableServerError(error);
        toast.error(() => <div className="toast-msg-body">{readableServerError}</div>);
        return Promise.reject(error);
    });
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
          <Route path="workspace/*" element={
              <Workspace  />
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

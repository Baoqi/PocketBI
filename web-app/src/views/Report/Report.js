
import React, { Component } from 'react';
import { Route, Routes } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import './Report.css';
import * as Constants from '../../api/Constants';
import ReportEditView from './ReportEditView';
import { Modal } from 'antd';
import SearchInput from '../../components/SearchInput/SearchInput';
import { withRouter } from '../../components/routing/RouterUtil';
import {createRecord, getFullRecordList} from "../../api/PocketBaseApi";

const ROUTE_WORKSPACE_REPORT = '/workspace/report/';
const ROUTE_PATTERNS = [ROUTE_WORKSPACE_REPORT];
const AD_HOC = 'Ad Hoc';

class Report extends Component {

  constructor(props) {
    super(props);
    const { t } = this.props;
    this.state = {
      searchValue: '',
      reports: [],
      showEditPanel: false,
      activeReportId: 0,
      name: '',
      project: '',
      activeTab: t(AD_HOC),
      projects: [],
      nonProjectReports: []
    }
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const { t } = this.props;
    for (let i = 0; i < ROUTE_PATTERNS.length; i++) {
      const pattern = ROUTE_PATTERNS[i];
      const index = pathname.indexOf(pattern);
      if (index !== -1) {
        const activeReportId = Number(pathname.substring(index + pattern.length));
        let activeTab;
        if (pattern === ROUTE_WORKSPACE_REPORT) {
          activeTab = t(AD_HOC);
          this.setState({
            activeReportId: activeReportId,
            activeTab: activeTab
          });
        }
        break;
      }
    }
    this.fetchReports();
  }

  fetchReports = () => {
    getFullRecordList('vis_report')
      .then(res => {
        const reports = res || [];
        const projects = [];
        const nonProjectReports = [];
        for (let i = 0; i < reports.length; i++) {
          const report = reports[i];
          const {
            project
          } = report;
          if (project) {
            const index = projects.findIndex(p => p.name === project);
            if (index !== -1) {
              projects[index].reports.push(report);
            } else {
              const reports = [];
              reports.push(report);
              projects.push({
                showReports: false,
                name: project,
                reports: reports
              });
            }
          } else {
            nonProjectReports.push(report);
          } 
        }
        this.setState({ 
          reports: reports,
          projects: projects,
          nonProjectReports: nonProjectReports
        });
      });
  }

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleNameInputChange = (name, value) => {
    this.setState({
      [name]: value
    });
  }

  onTabChange = (activeTab) => {
    this.setState({
      activeTab: activeTab,
      activeReportId: 0
    }, () => {
      this.props.navigate('/workspace/report');
    });
  }

  closeEditPanel = () => {
    this.setState({
      showEditPanel: false,
      name: '',
      project: ''
    });
  }

  save = () => {
    const {
      name,
      project
    } = this.state;

    if (!name) {
      toast.error('Enter a name.');
      return;
    }

    const report = {
      name: name,
      project: project,
      style: {
        height: Constants.DEFAULT_REPORT_HEIGHT,
        backgroundColor: 'rgba(233, 235, 238, 1)',
        isFixedWidth: true,
        fixedWidth: Constants.DEFAULT_REPORT_FIXED_WIDTH,
        autoFilter: false
      }
    };

    createRecord('vis_report', report)
      .then(res => {
        const reportId = res.id;
        this.closeEditPanel();
        this.fetchReports();
        this.props.navigate(`/workspace/report/${reportId}`);
        this.setState({
          activeReportId: reportId,
        });
      })
      .catch(error => {
        toast.error('The name exists. Try another.');
      });
  }

  viewReport = (reportId) => {
    this.setState({
      activeReportId: reportId
    }, () => {
      this.props.navigate(`/workspace/report/${reportId}`);
    });
  }


  onReportSave = (reportId) => {
    this.fetchReports();
  }

  onReportDelete = (reportId) => {
    this.fetchReports();
    this.setState({
      activeReportId: 0
    }, () => {
      this.props.navigate('/workspace/report');
    });
  }

  toggleProject = (projectName) => {
    const {
      projects
    } = this.state;

    const index = projects.findIndex(p => p.name === projectName);
    const newProjects = [...projects];
    const { showReports = false } = newProjects[index];
    newProjects[index].showReports = !showReports;
    this.setState({
      projects: newProjects
    });
  }

  render() {
    const { t } = this.props;

    const {
      reports = [],
      activeReportId,
      searchValue,
      projects = [],
      nonProjectReports = []
    } = this.state;

    const {
      sysRole
    } = this.props;
    const editable = sysRole === Constants.SYS_ROLE_VIEWER ? false : true;

    const projectRows = [];
    for (let i = 0; i < projects.length; i++) {
      const {
        name: projectName,
        reports = [],
        showReports = false
      } = projects[i];
      const reportRows = [];
      for (let j = 0; j < reports.length; j++) {
        const report = reports[j];
        const reportName = report.name;
        const menuActive = activeReportId === report.id ? 'report-menu-item-active' : '';
        if (!searchValue || (searchValue && reportName.includes(searchValue))) {
          reportRows.push(
            (
              <div key={j} className={`report-menu-item ellipsis ${menuActive}`} style={{marginLeft: '12px'}} onClick={() => this.viewReport(report.id)}>
                {reportName}
              </div>
            )
          )
        }
      }

      projectRows.push(
        <div key={i}>
          <div className="project-row ellipsis" onClick={() => this.toggleProject(projectName)}>
            {showReports ? (
              <React.Fragment>
                <FontAwesomeIcon icon="angle-right" size="lg" fixedWidth /> {projectName}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <FontAwesomeIcon icon="angle-down" size="lg" fixedWidth /> {projectName}
              </React.Fragment>
            )}
          </div>
          {showReports && (
            <div>
              {reportRows}
            </div>
          )}
        </div>
      );
    }

    const nonProjectReportRows = [];
    for (let i = 0; i < nonProjectReports.length; i++) {
      const report = nonProjectReports[i];
      const name = report.name;
      const menuActive = activeReportId === report.id ? 'report-menu-item-active' : '';
      if (!searchValue || (searchValue && name.includes(searchValue))) {
        nonProjectReportRows.push(
          (
            <div key={i} className={`report-menu-item ellipsis ${menuActive}`} onClick={() => this.viewReport(report.id)}>
              {name}
            </div>
          )
        )
      }
    }

    const info = editable && reports.length === 0 ? 'Create a new report!' : 'Select a report!';

    return (
      <React.Fragment>
        <div className="report-sidebar">
          <div style={{margin: '8px 5px 5px 5px'}}>
            { editable && (
              <button className="button full-width" onClick={() => this.setState({ showEditPanel: true })}>
                <FontAwesomeIcon icon="plus" /> {t('New')}
              </button>
            )}
          </div>
          <div style={{margin: '8px 5px 5px 5px'}}>
            <SearchInput 
              name={'searchValue'} 
              value={this.state.searchValue} 
              onChange={this.handleNameInputChange} 
            />
          </div>
          <div style={{padding: '0px 5px'}}>
            {/*<Tabs*/}
            {/*  activeTab={this.state.activeTab}*/}
            {/*  onTabChange={this.onTabChange}*/}
            {/*  >*/}

              <div title={t('Ad Hoc')} iconOnly={true} icon={'clipboard'}>
                {projectRows}
                {nonProjectReportRows}
              </div>

            {/*</Tabs>*/}
            
          </div>
        </div>
        <div className="report-content">
          <Routes>
            <Route
                exact path=":id"
                element={
                    <ReportEditView
                        key={this.props.location.key}
                        onReportSave={this.onReportSave}
                        onReportDelete={this.onReportDelete}
                        editable={editable}
                        reportType={Constants.ADHOC}
                    />
                }
            />
            <Route element = {<EmptyReport
                info={t(info)}
            />} />
          </Routes>
        </div>

        <Modal 
          open={this.state.showEditPanel}
          onCancel={() => this.setState({ showEditPanel: false })}
          onOk={this.save}
          okText={t('Save')}
          maskClosable={false}
          title={t('New')} >
          <div className="form-panel">
            <label>{t('Name')}</label>
            <input 
              className="form-input"
              type="text" 
              name="name" 
              value={this.state.name}
              onChange={this.handleInputChange} 
            />

            <label>{t('Project')}</label>
            <input 
              className="form-input"
              type="text" 
              name="project" 
              value={this.state.project}
              onChange={this.handleInputChange} 
            />
          </div>
        </Modal>

      </React.Fragment>
    );
  }
}

function EmptyReport({info}) {
  return (
    <div className="empty-report">
      {info}
    </div>
  )
}

export default (withTranslation()(withRouter(Report)));

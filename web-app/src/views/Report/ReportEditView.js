
import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import ComponentViewPanel from './ComponentViewPanel';
import ComponentEditPanel from './ComponentEditPanel';

import {Modal, Tooltip} from 'antd';
import ColorPicker from '../../components/ColorPicker/ColorPicker';
import Checkbox from '../../components/Checkbox/Checkbox';
import { withRouter } from '../../components/routing/RouterUtil';

import * as Constants from '../../api/Constants';
import * as Util from '../../api/Util';
import './Report.css';
import {
  client,
  createRecord,
  deleteOneRecord,
  getFullRecordList,
  getOneRecord,
  updateRecord
} from "../../api/PocketBaseApi";
import DropdownDialog from "../../components/DropdownDialog/DropdownDialog";
import axios from "axios";



class ReportEditView extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      // Modal
      showComponentEditPanel: false,
      showConfirmDeletionPanel: false,
      showCannedReportPanel: false,
      showControl: true,
      showSharePanel: false,
      showFunctionButtonDialog: false,
      isPendingApplyFilters: false,
      objectToDelete: {},
      isEditMode: false,
      isFullScreenView: false,
      autoRefreshTimerId: '',
      lastRefreshed: '',
      refreshInterval: 15,
      lastRefreshLabelTimerId: '',
      jdbcDataSourceOptions: [],
      jdbcDataSources: [],
      fromReport: '',
      reportId: 0,
      name: '',
      project: '',
      style: {},
      reportType: '',
      reportViewWidth: 1000,
      cannedReportName: '',
      cannedReportData: {},
      shareKeyId: ''
    }

    this.componentViewPanel = React.createRef();
    this.componentEditPanel = React.createRef();
  }

  componentDidMount() {
    const thisNode = ReactDOM.findDOMNode(this);
    if (thisNode) {
      const { ownerDocument } = thisNode;
      ownerDocument.addEventListener("keydown", this.onKeyDown);
    }

    const id = this.props.params.id;
    if (id === undefined) {
      // If the drill through is triggered from the full-report page already, this component is remounted but not FullScreenView.
      const url = this.props.location.search;
      const params = new URLSearchParams(url);
      const reportName = params.get('$toReport');
      const shareKey = params.get('$shareKey');
      if (reportName !== null) {
        this.loadViewByReportName();
        return;
      } else if (shareKey !== null) {
        this.loadViewByShareKey();
        return;
      }
    }
    const reportId = id !== undefined ? id : null;
    const url = this.props.location.search;
    const searchParams = new URLSearchParams(url);
    const fromReport = searchParams.get('$fromReport');

    const reportViewWidth = this.getPageWidth();
    this.setState({
      reportViewWidth: reportViewWidth,
      fromReport: fromReport
    }, () => {
      if (reportId === null) {
        this.setState({
          reportId: null
        });
      } else {
        const { reportType } = this.props;
        if (reportType === Constants.ADHOC) {
          getOneRecord('vis_report', reportId)
            .then(res => {
              const report = res;
              this.setState({
                reportId: report.id,
                name: report.name,
                style: report.style,
                reportType: reportType,
                project: report.project
              }, () => {
                this.refresh();
              });
            });
        } else if (reportType === Constants.CANNED) {
          getOneRecord('vis_canned_report', reportId)
              .then(res => {
                const cannedReport = res;
                const { data: report } = cannedReport;
                this.setState({
                  reportId: cannedReport.id,
                  name: report.name,
                  style: report.style,
                  reportType: reportType,
                  cannedReportData: report
                }, () => {
                  this.refresh();
                });
              });
        }
      }
    });

    const lastRefreshLabelTimerId = setInterval(() => {
      this.updateReadableLastRefreshed();
    }, 5000);
    this.setState({
      lastRefreshLabelTimerId: lastRefreshLabelTimerId
    })
  }

  componentWillUnmount() {
    const { 
      autoRefreshTimerId,
      lastRefreshLabelTimerId
    } = this.state;
    if (autoRefreshTimerId) {
      clearInterval(autoRefreshTimerId);
    }
    if (lastRefreshLabelTimerId) {
      clearInterval(lastRefreshLabelTimerId);
    }

    const thisNode = ReactDOM.findDOMNode(this);
    if (thisNode) {
      const { ownerDocument } = thisNode;
      ownerDocument.removeEventListener('keydown', this.onKeyDown);
    }
  }

  onKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.applyFilters();
    }
  }

  loadViewByReportName = () => {
    const url = this.props.location.search;
    const params = new URLSearchParams(url);

    let showControl = params.get('$showControl');
    showControl = showControl === null ? true : showControl === 'true';
    const fromReport = params.get('$fromReport');
    const reportName = params.get('$toReport');
    let reportType = params.get('$reportType');
    reportType = reportType === Constants.CANNED ? Constants.CANNED : Constants.ADHOC;
    const reportViewWidth = this.getPageWidth();

    this.setState({
      isFullScreenView: true,
      name: reportName,
      reportViewWidth: reportViewWidth,
      fromReport: fromReport,
      showControl: showControl,
      reportType: reportType
    }, () => {
      let collectionName = 'vis_report';
      if (reportType === Constants.CANNED) {
        collectionName = 'vis_canned_report';
      }
      getFullRecordList(collectionName, {
        filter: `name="${reportName}"`
      })
        .then(res => {
          if (res?.length > 0) {
            if (reportType === Constants.ADHOC) {
              const result = res[0];
              this.setState({
                reportId: result.id,
                name: result.name,
                style: result.style
              }, () => {
                this.refresh();
              });
            } else {
              const cannedReport = res[0];
              const { data: report } = cannedReport;
              this.setState({
                reportId: cannedReport.id,
                name: report.name,
                style: report.style,
                reportType: reportType,
                cannedReportData: report
              }, () => {
                this.refresh();
              });
            }
          }
        });
    });
  }

  loadViewByShareKey = () => {
    const url = this.props.location.search;
    const params = new URLSearchParams(url);
    const shareKey = params.get('$shareKey');
    const reportViewWidth = this.getPageWidth();
    this.setState({
      isFullScreenView: true,
      reportViewWidth: reportViewWidth,
      reportType: Constants.CANNED
    }, () => {
      // MAYBE: support canned report? can only handle Adhoc report for now.
      axios.post(`/biz/get-report-by-key`,
          {
            share_key: shareKey
          })
          .then(res => {
            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            const { data: report } = res.data;

            this.setState({
              reportId: res.data.id,
              name: report.name,
              style: report.style,
              reportType: Constants.CANNED,
              cannedReportData: report
            }, () => {
              this.refresh();
            });
          });
    });
  }

  handleInputChange = (name, value) => {
    this.setState({
      [name]: value
    });
  }

  getPageWidth = () => {
    const thisNode = ReactDOM.findDOMNode(this);
    return thisNode.clientWidth - 40;
  }

  toggleAutoRefresh = () => {
    const { autoRefreshTimerId } = this.state;
    if (autoRefreshTimerId) {
      clearInterval(autoRefreshTimerId);
      this.setState({
        autoRefreshTimerId: ''
      });
    } else {
      const { refreshInterval } = this.state;
      let interval = parseInt(refreshInterval, 10) || 15;
      interval = interval < 1 ? 1 : interval;
      const timerId = setInterval(() => {
        this.applyFilters();
      }, interval * 1000);
      this.setState({
        autoRefreshTimerId: timerId
      });
    }
  }

  refresh = async () => {
    await this.refreshDataSources();
    this.refreshComponentView();
    this.updateLastRefreshed();
  }

  refreshDataSources = async () => {
    const {
      reportType
    } = this.state;

    if (reportType === Constants.ADHOC) {
      await getFullRecordList('vis_datasource')
          .then(res => {
            const jdbcDataSources = res;
            this.setState({
              jdbcDataSources: jdbcDataSources
            });
          });
    }
  }

  refreshComponentView = () => {
    const { 
      reportId,
      reportViewWidth,
      reportType,
      cannedReportData
    } = this.state;

    if (reportType === Constants.ADHOC) {
      this.componentViewPanel.current.fetchComponents(reportId, reportViewWidth, this.getUrlFilterParams());
    } else if (reportType === Constants.CANNED) {
      const {
        components = []
      } = cannedReportData;
      this.componentViewPanel.current.buildViewPanel(components, reportViewWidth, false);
    }
  }

  updateLastRefreshed = () => {
    const now = new Date();
    this.setState({
      lastRefreshed: now
    }, () => {
      this.updateReadableLastRefreshed();
    });
  }

  updateReadableLastRefreshed = () => {
    const { lastRefreshed } = this.state;
    if (lastRefreshed instanceof Date) {
      const readableLastRefreshed = Util.getReadableDiffTime(lastRefreshed, new Date());
      this.setState({
        readableLastRefreshed: readableLastRefreshed
      })
    }
  }

  save = () => {
    const {
      reportId,
      name,
      project,
      style = {}
    } = this.state;

    if (style.height < 100) {
      toast.error('Minimum height is 100');
      return;
    }

    if (style.isFixedWidth && style.fixedWidth < 100) {
      toast.error('Minimum width is 100');
      return;
    }

    const report = {
      id: reportId, 
      name: name,
      project: project,
      style: style
    };

    updateRecord('vis_report', report.id, report)
      .then(res => {
        this.props.onReportSave(reportId);
        this.setState({
          isEditMode: false
        });
      });
  }

  edit = () => {
    this.setState({
      isEditMode: true
    });
  }

  cancelEdit = () => {
    this.setState({
      isEditMode: false
    });
  }

  onComponentSave = (componentId) => {
    this.setState({ 
      showComponentEditPanel: false 
    });
    this.componentViewPanel.current.handleSavedComponent(componentId);
  }

  openComponentEditPanel = (componentId) => {
    this.componentEditPanel.current.fetchComponent(componentId);
    this.setState({
      showComponentEditPanel: true
    });
  }

  applyFilters = () => {
    const {
      reportType
    } = this.state;
    if (reportType === Constants.ADHOC) {
      this.componentViewPanel.current.queryCharts(this.getUrlFilterParams());
    } else if (reportType === Constants.CANNED) {
      // TODO: query local data.
    }
    this.setState({
      isPendingApplyFilters: false
    });
    this.updateLastRefreshed();
  }

  fullScreen = () => {
    const { name, reportType } = this.state;
    const url = `/workspace/report/fullscreen?$toReport=${name}&$reportType=${reportType}`;
    window.open(url, '_blank');
  }

  handleStyleValueChange = (name, value) => {
    const style = {...this.state.style};
    style[[name]] = value;
    this.setState({
      style: style
    }, () => {
      if (name === 'isFixedWidth' || name === 'fixedWidth') {
        this.refreshComponentView();
      }
    });
  }

  onComponentContentClick = (componentClickEvent) => {
    const {
      name,
      isFullScreenView
    } = this.state;

    const {
      type,
      data
    } = componentClickEvent;

    if (type === 'tableTdClick' || type === 'chartClick') {
       const {
        reportId,
        columnName,
        columnValue
      } = data;
      if (isFullScreenView) {
        getOneRecord('vis_report', reportId)
          .then(res => {
            const report = res;
            const nextReport = report.name;
            const nextLink = `/workspace/report/fullscreen?$toReport=${nextReport}&$fromReport=${name}&${columnName}=${columnValue}`;
            this.props.navigate(nextLink);
          });
      } else {
        const nextLink = `/workspace/report/${reportId}?$fromReport=${name}&${columnName}=${columnValue}`;
        this.props.navigate(nextLink);
      }
    }
  }

  onComponentFilterInputChange = () => {
    if (this.isAutoFilter()) {
      this.applyFilters();
    } else {
      this.setState({
        isPendingApplyFilters: true
      });
    }
  }

  isAutoFilter = () => {
    const {
      style = {}
    } = this.state;
    const {
      autoFilter = false
    } = style;
    return autoFilter;
  }

  goBackToFromReport = () => {
    this.props.navigate(-1);
  }

  confirmDelete = () => {
    const { 
      objectToDelete = {},
      reportType
    } = this.state;
    const reportId = objectToDelete.id;
    
    if (reportType === Constants.ADHOC) {
      deleteOneRecord('vis_report', reportId)
        .then(res => {
          this.props.onReportDelete(reportId);
          this.closeConfirmDeletionPanel();
        });
    } else if (reportType === Constants.CANNED) {
      deleteOneRecord('vis_canned_report', reportId)
          .then(res => {
            this.props.onCannedReportDelete(reportId);
            this.closeConfirmDeletionPanel();
          });
    }
  }

  deleteReport = () => {
    const { 
      reportId,
      name
    } = this.state;
    const report = {
      id: reportId,
      name: name
    }
    this.openConfirmDeletionPanel(report);
  }

  openConfirmDeletionPanel = (report) => {
    this.setState({
      objectToDelete: report,
      showConfirmDeletionPanel: true
    });
  }

  closeConfirmDeletionPanel = () => {
    this.setState({
      objectToDelete: {},
      showConfirmDeletionPanel: false
    });
  }

  getUrlFilterParams = () => {
    const urlFilterParams = [];
    const url = this.props.location.search;
    const searchParams = new URLSearchParams(url);
    for(let pair of searchParams.entries()) {
      const key = pair[0];
      const value = pair[1];
      const filterParam = {
        type: Constants.SINGLE_VALUE,
        param: key,
        value: value
      };
      urlFilterParams.push(filterParam);
    }
    return urlFilterParams;
  }

  saveCannedReport = () => {
    const {
      cannedReportName,
      style = {}
    } = this.state;

    if (!cannedReportName) {
      toast.error('Enter a name.');
      return;
    }

    const components = this.componentViewPanel.current.getComponentsSnapshot();
    if (Util.isArrayEmpty(components)) {
      toast.error('Report is empty.');
      return;
    }

    const report = {
      created_by: client.authStore.model.id,
      name: cannedReportName,
      data: {
        name: cannedReportName,
        style: style,
        components: components
      }
    };

    createRecord('vis_canned_report', report)
        .then(res => {
          this.setState({
            showCannedReportPanel: false,
            cannedReportName: ''
          });
          toast.success('Saved.');
          this.props.onCannedReportSave();
        });
  }

  openSharePanel = () => {
    const {
      reportId,
    } = this.state;

    getFullRecordList('vis_shared_report', {
      filter: `report_id="${reportId}"`
    }).then(res => {
      if (res?.length > 0) {
        const result = res[0];
        this.setState({
          showSharePanel: true,
          shareKeyId: result.id,
        });
      } else {
        this.setState({
          showSharePanel: true,
          shareKeyId: '',
        });
      }
    });
  }

  generateShareUrl = () => {
    const {
      reportId,
      shareKeyId
    } = this.state;
    if (shareKeyId) {
      toast.error("Already shared.");
      return;
    }

    const sharedReport = {
      created_by: client.authStore.model.id,
      report_id: reportId,
    }

    createRecord('vis_shared_report', sharedReport)
        .then(res => {
          this.setState({
            shareKeyId: res.id,
            showSharePanel: false
          }, () => {
            toast.success('Shared.');
          });
        });
  }

  onDatePickerChange = (name, date) => {
    this.setState({
      [name]: date
    });
  }

  render() {
    const { t } = this.props;

    const {
      autoRefreshTimerId,
      readableLastRefreshed,
      isEditMode,
      isFullScreenView,
      fromReport,
      showControl,
      reportType,
      isPendingApplyFilters,
      isExporting
    } = this.state;
    const autoRefreshStatus = autoRefreshTimerId === '' ? 'OFF' : 'ON';
    const pendingApplyFiltersStyle = isPendingApplyFilters ? 'font-blue' : '';

    const commonButtonPanel = (
      <React.Fragment>
        <div className="inline-block" style={{marginRight: '8px', lineHeight: '32px'}}>
          {t('Last refreshed')}: {readableLastRefreshed}
        </div>
        { autoRefreshStatus === 'OFF' && (
          <input 
            className="form-input inline-block"
            type="text" 
            name="refreshInterval" 
            value={this.state.refreshInterval}
            onChange={(event) => this.handleInputChange('refreshInterval', event.target.value)}
            style={{width: '50px', marginRight: '4px'}}
          />
        )}
        <button className="button square-button button-transparent" onClick={this.toggleAutoRefresh}>
          {
            autoRefreshStatus === 'ON' ? 
            (
              <FontAwesomeIcon icon="stop-circle"  fixedWidth />
            ) : 
            (
              <FontAwesomeIcon icon="play-circle"  fixedWidth />
            )
          }
        </button>
        <button className="button square-button button-transparent ml-4" onClick={this.refresh}>
          <FontAwesomeIcon icon="redo-alt"  fixedWidth />
        </button>

        { !this.isAutoFilter() && (
          <button className={`button ml-4 ${pendingApplyFiltersStyle}`} onClick={this.applyFilters}>
            <FontAwesomeIcon icon="filter"  fixedWidth /> {t('Apply Filters')}
          </button>
        )}
      </React.Fragment>
    );

    // buttons not displayed in full screen view.
    const fullScreenExcludeButtonPanel = (
      <React.Fragment>
        <Tooltip title={t('Show')}>
          <button className="button square-button button-transparent ml-4" onClick={() => this.setState({ showFunctionButtonDialog: true })}>
            <FontAwesomeIcon icon="ellipsis-h" fixedWidth />
          </button>
        </Tooltip>
      </React.Fragment>
    );

    const inEditModeButtonPanel = (
      <React.Fragment>
        <button className="button ml-4" onClick={() => this.openComponentEditPanel(null)}>
          <FontAwesomeIcon icon="calendar-plus"  fixedWidth /> {t('New Component')}
        </button>
        <button className="button square-button button-transparent ml-4" onClick={this.deleteReport}>
          <FontAwesomeIcon icon="trash-alt"  fixedWidth />
        </button>
      </React.Fragment>
    )

    const editButton = (
      <Tooltip title={t('Edit')}>
        <button className="button square-button button-transparent ml-4" onClick={this.edit}>
          <FontAwesomeIcon icon="edit"  fixedWidth />
        </button>
      </Tooltip>
    );

    let buttonGroupPanel;
    if (isFullScreenView) {
      buttonGroupPanel = commonButtonPanel;
    } else {
      if (this.props.editable) {
        if (isEditMode) {
          buttonGroupPanel = inEditModeButtonPanel;
        } else {
          buttonGroupPanel = (
            <React.Fragment>
              {commonButtonPanel}
              {fullScreenExcludeButtonPanel}
              {editButton}
            </React.Fragment>
          );
        }
      } else {
        if (reportType === Constants.ADHOC) {
          buttonGroupPanel = (
            <React.Fragment>
              {commonButtonPanel}
              {fullScreenExcludeButtonPanel}
            </React.Fragment>
          );
        } else if (reportType === Constants.CANNED) {
          buttonGroupPanel = (
              <React.Fragment>
                <Tooltip title={t('Show')}>
                  <button className="button square-button button-transparent ml-4" onClick={this.fullScreen}>
                    <FontAwesomeIcon icon="tv" fixedWidth />
                  </button>
                </Tooltip>
                <Tooltip title={t('Share')}>
                  <button className="button square-button button-transparent ml-4" onClick={this.openSharePanel}>
                    <FontAwesomeIcon icon="share-square" title={t('Share')} fixedWidth />
                  </button>
                </Tooltip>
                <button className="button square-button button-transparent ml-4" onClick={this.deleteReport}>
                  <FontAwesomeIcon icon="trash-alt"  fixedWidth />
                </button>
              </React.Fragment>
          );
        }
      }
    }

    return (
      <React.Fragment>
        <div className="report-menu-panel row">
          <div className="float-left">
            {fromReport && (
              <div className="report-drillthrough-name" onClick={this.goBackToFromReport}>
                <span className="link-label">{fromReport}</span> >
              </div>
            )}
          </div>
          <div className="float-left">
            {
              isFullScreenView || !isEditMode ?
              (
                <div className="report-name">
                  {this.state.name}
                </div>
              ) :(
                <input 
                  className="form-input report-name-input"
                  type="text" 
                  name="name" 
                  value={this.state.name}
                  onChange={(event) => this.handleInputChange('name', event.target.value)}  
                />
              )
            }
          </div>
          { showControl && (
            <div className="float-right">
              {buttonGroupPanel}
            </div>
          )}
        </div>
        

        <ComponentViewPanel 
          ref={this.componentViewPanel} 
          isEditMode={isEditMode}
          reportViewWidth={this.state.reportViewWidth}
          onComponentEdit={this.openComponentEditPanel}
          onStyleValueChange={this.onStyleValueChange}
          onComponentContentClick={this.onComponentContentClick}
          onComponentFilterInputChange={this.onComponentFilterInputChange}
          reportType={reportType}
          jdbcDataSources={this.state.jdbcDataSources}
          {...this.state.style}
        />

        <ComponentEditPanel
            open={this.state.showComponentEditPanel}
            onCancel={() => this.setState({ showComponentEditPanel: false })}
            ref={this.componentEditPanel} 
            jdbcDataSourceOptions={this.state.jdbcDataSourceOptions}
            jdbcDataSources={this.state.jdbcDataSources}
            reportId={this.state.reportId}
            onSave={this.onComponentSave}
        />

        <Modal
            open={this.state.showCannedReportPanel}
            onCancel={() => this.setState({ showCannedReportPanel: false })}
            onOk={this.saveCannedReport}
            okText={t('Save')}
            title={t('Save Canned Report')} >
          <div className="form-panel">
            <label>{t('Name')}</label>
            <input
                className="form-input"
                type="text"
                name="cannedReportName"
                value={this.state.cannedReportName}
                onChange={(event) => this.handleInputChange('cannedReportName', event.target.value)}
            />
          </div>
        </Modal>

        <Modal
          open={this.state.showConfirmDeletionPanel}
          onCancel={this.closeConfirmDeletionPanel}
          onOk={this.confirmDelete}
          okText={t('Delete')}
          title={t('Confirm Deletion')}>
          <div className="confirm-deletion-panel">
            {t('Are you sure you want to delete')} {this.state.objectToDelete.name}?
          </div>
        </Modal>

        <Modal
            open={this.state.showSharePanel}
            onCancel={() => this.setState({ showSharePanel: false })}
            title={t('Share')}
            onOk={this.generateShareUrl}
            okText={t('Generate URL')}
        >
          <div className="form-panel">
            <label>{t('Name')}</label>
            <div className="form-input bg-grey">{this.state.name}</div>

            <label>{t('Type')}</label>
            <div className="form-input bg-grey">{this.state.reportType}</div>

            { this.state.shareKeyId && (
                <React.Fragment>
                  <label>{t('Share Key')}</label>
                  <div className="form-input word-break-all bg-grey">
                    <a href={'/shared_report?$shareKey=' + this.state.shareKeyId} target={'_blank'}>{this.state.shareKeyId}</a>
                  </div>
                </React.Fragment>
            )}
          </div>
        </Modal>

        {isEditMode && (
          <div className="report-side-panel">
            <div className="side-panel-content" style={{margin: '3px 0px'}}>
              <button className="icon-button button-green" onClick={this.save}>
                <FontAwesomeIcon icon="save"   />
              </button>
              <button className="icon-button button-black" style={{marginLeft: '5px'}} onClick={this.cancelEdit}>
                <FontAwesomeIcon icon="times"  />
              </button>
            </div>
            <div className="side-panel">
              <div className="side-panel-title">{t('General')}</div>

              <div className="side-panel-content">
                <div className="row side-panel-content-row" style={{marginBottom: '5px'}}>
                  <div className="float-left">{t('Project')}</div>
                  <div className="float-right">
                    <input 
                      className="side-panel-input"
                      type="text" 
                      name="project" 
                      value={this.state.project}
                      onChange={(event) => this.handleInputChange('project', event.target.value)} 
                      style={{width: '80px'}}
                    />
                  </div>
                </div>

                <div className="row side-panel-content-row" style={{marginBottom: '5px'}}>
                  <div className="float-left">{t('Fixed Width')}</div>
                  <div className="float-right">
                    <Checkbox name="isFixedWidth" value="" checked={this.state.style.isFixedWidth} onChange={this.handleStyleValueChange} />
                  </div>
                </div>

                { this.state.style.isFixedWidth && (
                  <div className="row side-panel-content-row" style={{marginBottom: '5px'}}>
                    <div className="float-left">{t('Width')}</div>
                    <div className="float-right">
                      <input 
                        className="side-panel-input side-panel-number-input"
                        type="text" 
                        name="fixedWidth" 
                        value={this.state.style.fixedWidth}
                        onChange={(event) => this.handleStyleValueChange('fixedWidth', event.target.value)} 
                      />
                    </div>
                  </div>
                )}

                <div className="row side-panel-content-row">
                  <div className="float-left">{t('Height')}</div>
                  <div className="float-right">
                    <input 
                      className="side-panel-input side-panel-number-input"
                      type="text" 
                      name="height" 
                      value={this.state.style.height}
                      onChange={(event) => this.handleStyleValueChange('height', event.target.value)} 
                    />
                  </div>  
                </div>
              </div>

              
              <div className="side-panel-title row">{t('Background')}</div>
              <div className="side-panel-content">
                <div className="row side-panel-content-row" style={{marginBottom: '5px'}}>
                  <div className="float-left">{t('Color')}</div>
                  <div className="float-right" style={{paddingTop: '4px'}}>
                    <ColorPicker name={'backgroundColor'} value={this.state.style.backgroundColor} onChange={this.handleStyleValueChange} />
                  </div>  
                </div>

                <div className="row side-panel-content-row" style={{marginBottom: '5px'}}>
                  <div className="float-left">{t('Snap To Grid')}</div>
                  <div className="float-right">
                    <Checkbox name="snapToGrid" value="" checked={Boolean(this.state.style.snapToGrid)} onChange={this.handleStyleValueChange} />
                  </div>
                </div>

                <div className="row side-panel-content-row">
                  <div className="float-left">{t('Show Gridlines')}</div>
                  <div className="float-right">
                    <Checkbox name="showGridlines" value="" checked={Boolean(this.state.style.showGridlines)} onChange={this.handleStyleValueChange} />
                  </div>
                </div>

              </div>

              <div className="side-panel-title row">{t('Control')}</div>
              <div className="side-panel-content">
                <div className="row side-panel-content-row">
                  <div className="float-left">{t('Auto Filter')}</div>
                  <div className="float-right">
                    <Checkbox name="autoFilter" value="" checked={this.state.style.autoFilter} onChange={this.handleStyleValueChange} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {isExporting && (
          <div className="exporting-overlay">
            <div className="exporting-panel">
              <div className="exporting-panel-title">{t('Exporting...')}</div>
              <FontAwesomeIcon icon="circle-notch" spin={true} size="2x" />
            </div>
          </div>
        )}

        <DropdownDialog
            show={this.state.showFunctionButtonDialog}
            onClose={() => this.setState({ showFunctionButtonDialog: false })}
        >
          <div className="form-panel">
            <Tooltip title={t('Save Canned Report')}>
              <button className="button square-button button-transparent ml-4" onClick={() => this.setState({ showCannedReportPanel: true })}>
                <FontAwesomeIcon icon="archive" fixedWidth />
              </button>
            </Tooltip>
            <Tooltip title={t('Show')}>
              <button className="button square-button button-transparent ml-4" onClick={this.fullScreen}>
                <FontAwesomeIcon icon="tv" fixedWidth />
              </button>
            </Tooltip>
          </div>
        </DropdownDialog>
      </React.Fragment>
    )
  };
}

export default (withTranslation()(withRouter(ReportEditView)));

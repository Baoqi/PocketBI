
import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import ComponentViewPanel from './ComponentViewPanel';
import ComponentEditPanel from './ComponentEditPanel';

import Modal from '../../components/Modal/Modal';
import ColorPicker from '../../components/ColorPicker/ColorPicker';
import Checkbox from '../../components/Checkbox/Checkbox';
import { withRouter } from '../../components/routing/RouterUtil';

import * as Constants from '../../api/Constants';
import * as Util from '../../api/Util';
import './Report.css';
import {deleteOneRecord, getFullRecordList, getOneRecord, updateRecord} from "../../api/PocketBaseApi";



class ReportEditView extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      // Modal
      showComponentEditPanel: false,
      showConfirmDeletionPanel: false,
      showControl: true,
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
      reportViewWidth: 1000
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
      if (reportName !== null) {
        this.loadViewByReportName();
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
    //let reportType = params.get('$reportType');
    //reportType = reportType === Constants.CANNED ? Constants.CANNED : Constants.ADHOC;
    let reportType = Constants.ADHOC;
    const reportViewWidth = this.getPageWidth();

    this.setState({
      isFullScreenView: true,
      name: reportName,
      reportViewWidth: reportViewWidth,
      fromReport: fromReport,
      showControl: showControl,
      reportType: reportType
    }, () => {
      // MAYBE: support canned report?
      getFullRecordList('vis_report', {
        filter: `name="${reportName}"`
      })
        .then(res => {
          if (res?.length > 0) {
            const result = res[0];
            this.setState({
              reportId: result.id,
              name: result.name,
              style: result.style
            }, () => {
              this.refresh();
            });
          }
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

  refresh = () => {
    this.refreshDataSources();
    this.refreshComponentView();
    this.updateLastRefreshed();
  }

  refreshDataSources = () => {
    const {
      reportType
    } = this.state;

    if (reportType === Constants.ADHOC) {
      getFullRecordList('vis_datasource')
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
      reportType
    } = this.state;

    if (reportType === Constants.ADHOC) {
      this.componentViewPanel.current.fetchComponents(reportId, reportViewWidth, this.getUrlFilterParams());
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
    }
    this.setState({
      isPendingApplyFilters: false
    });
    this.updateLastRefreshed();
  }

  fullScreen = () => {
    const { name } = this.state;
    const url = `/workspace/report/fullscreen?$toReport=${name}`;
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
        <button className="button square-button button-transparent ml-4" onClick={this.fullScreen}>
          <FontAwesomeIcon icon="tv" title={t('Show')}  fixedWidth />
        </button>
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
      <button className="button square-button button-transparent ml-4" onClick={this.edit}>
        <FontAwesomeIcon icon="edit"  fixedWidth />
      </button>
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

        <Modal 
          show={this.state.showComponentEditPanel}
          onClose={() => this.setState({ showComponentEditPanel: false })}
          modalClass={'report-edit-component-dialog'} 
          title={t('Component')} >
          <ComponentEditPanel 
            ref={this.componentEditPanel} 
            jdbcDataSourceOptions={this.state.jdbcDataSourceOptions}
            jdbcDataSources={this.state.jdbcDataSources}
            reportId={this.state.reportId}
            onSave={this.onComponentSave}
          />
        </Modal>

        <Modal 
          show={this.state.showConfirmDeletionPanel}
          onClose={this.closeConfirmDeletionPanel}
          modalClass={'small-modal-panel'}
          title={t('Confirm Deletion')}>
          <div className="confirm-deletion-panel">
            {t('Are you sure you want to delete')} {this.state.objectToDelete.name}?
          </div>
          <button className="button button-red full-width" onClick={this.confirmDelete}>{t('Delete')}</button>
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
      </React.Fragment>
    )
  };
}

export default (withTranslation()(withRouter(ReportEditView)));

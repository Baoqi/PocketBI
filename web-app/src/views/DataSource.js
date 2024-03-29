
import React, { Component } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { Modal } from 'antd';
import SearchInput from '../components/SearchInput/SearchInput';
import {createRecord, deleteOneRecord, getFullRecordList, updateRecord} from "../api/PocketBaseApi";
import {findItemById} from "../api/Util";

class DataSource extends Component {

  constructor(props) {
    super(props);
    this.state = {
      jdbcDataSources: [],
      showEditPanel: false,
      showConfirmDeletionPanel: false,
      objectToDelete: {},
      showUpdatePassword: false,
      searchValue: '',
      id: null,
      name: '',
      connectionUrl: '',
      driverClassName: '',
      username: '',
      password: '',
      ping: ''
    };
  }

  get initialState() {
    return {
      showUpdatePassword: false,
      id: null,
      name: '',
      connectionUrl: '',
      driverClassName: '',
      username: '',
      password: '',
      ping: ''
    };
  }

  componentDidMount() {
    this.fetchDataSources();
  }

  fetchDataSources() {
    getFullRecordList('vis_datasource')
      .then(res => {
        const jdbcDataSources = res;
        this.setState({ 
          jdbcDataSources: jdbcDataSources 
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

  save = () => {
    const {
      showUpdatePassword,
      id,
      connectionUrl,
      driverClassName,
      username,
      password,
      name,
      ping,
    } = this.state;

    if (!name) {
      toast.error('Enter a name.');
      return;
    }

    let ds = {
      connectionUrl: connectionUrl,
      driverClassName: driverClassName,
      username: username,
      name: name,
      ping: ping
    };

    if (id !== null) {
      ds.id = id;
      if (showUpdatePassword && password) {
        ds.password = password;
      }

      // Update
      updateRecord('vis_datasource', ds.id, ds)
        .then(res => {
          this.closeEditPanel();
          this.fetchDataSources();
        })
        .catch(error => {
          toast.error('The name exists. Try another.');
        });
    } else {
      ds.password = password;
      createRecord('vis_datasource', ds)
        .then(res => {
          this.closeEditPanel();
          this.fetchDataSources();
        })
        .catch(error => {
          toast.error('The name exists. Try another.');
        });
    } 
  }

  ping = (id) => {
    const { jdbcDataSources = [] } = this.state;
    const jdbcDataSource = findItemById(jdbcDataSources, id);
    if (!jdbcDataSource) {
      return;
    }

    axios.post(`/sqlquery/ping`, jdbcDataSource)
      .then(res => {
        const result = res.data;
        if (result === 'success') {
          toast.success('Ping Succeeded');
        } else {
          toast.error(result.error);
        }
      });
  }

  clearEditPanel = () => {
    this.setState(this.initialState);
  }

  openEditPanel = (ds) => {
    this.clearEditPanel();
    if (ds !== null) {
      this.setState({
        showUpdatePassword: false,
        id: ds.id,
        connectionUrl: ds.connectionUrl,
        driverClassName: ds.driverClassName,
        username: ds.username,
        name: ds.name,
        ping: ds.ping
      });
    }
    
    this.setState({
      showEditPanel: true
    }); 
  }

  closeEditPanel = () => {
    this.setState({
      showEditPanel: false
    });
  }

  confirmDelete = () => {
    const { 
      objectToDelete = {} 
    } = this.state;
    deleteOneRecord('vis_datasource', objectToDelete.id)
      .then(res => {
        this.fetchDataSources();
        this.closeConfirmDeletionPanel();
      });
  }

  openConfirmDeletionPanel = (datasource) => {
    this.setState({
      objectToDelete: datasource,
      showConfirmDeletionPanel: true
    });
  }

  closeConfirmDeletionPanel = () => {
    this.setState({
      objectToDelete: {},
      showConfirmDeletionPanel: false
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
      id,
      jdbcDataSources = [],
      searchValue,
      showConfirmDeletionPanel,
      objectToDelete = {}
    } = this.state;

    const mode = id === null ? 'New' : 'Edit';

    const jdbcDataSourceItems = [];
    for (let i = 0; i < jdbcDataSources.length; i++) {
      const ds = jdbcDataSources[i];
      const { 
        id,
        name 
      } = ds;
      if (!searchValue || (searchValue && name.includes(searchValue))) {
        jdbcDataSourceItems.push(
          (
            <div key={id} className="card float-left">
              <div className="card-header ellipsis">
                {name}
              </div>
              <div className="card-content"></div>
              <div className="card-footer row">
                <div className="float-right">
                  <button className="icon-button card-icon-button" onClick={() => this.openEditPanel(ds)}>
                    <FontAwesomeIcon icon="edit"  />
                  </button>
                  <button className="icon-button card-icon-button" onClick={() => this.openConfirmDeletionPanel(ds)}>
                    <FontAwesomeIcon icon="trash-alt"  />
                  </button>
                  <button className="icon-button card-icon-button" onClick={() => this.ping(ds.id)}>
                    <FontAwesomeIcon icon="plug"  />
                  </button>
                </div>
              </div>
            </div>
          )
        )
      }
    }

    return (
      <div className="full-page-content">
        <div className="row">
          <div className="float-left" style={{lineHeight: '33px', fontWeight: 700, marginRight: '15px'}}>
            {t('Data Source')}
          </div>
          <button className="button float-left" style={{marginRight: '5px'}} onClick={() => this.openEditPanel(null)}>
            <FontAwesomeIcon icon="plus" /> {t('New')}
          </button>
          <div className="float-left">
            <SearchInput 
              name={'searchValue'} 
              value={this.state.searchValue} 
              onChange={this.handleNameInputChange} 
              inputWidth={200}
            />
          </div>
        </div>
        <div className="row" style={{marginTop: '8px'}}>
          {jdbcDataSourceItems}
        </div>

        <Modal 
          open={this.state.showEditPanel}
          onOk={this.save}
          onCancel={this.closeEditPanel}
          maskClosable={false}
          width={560}
          style={{ top: 10 }}
          title={t(mode)}
          okText={t('Save')} >

          <div className="form-panel">
            <label>{t('Name')} <span className="required">*</span></label>
            <input 
              className="form-input"
              type="text" 
              name="name" 
              value={this.state.name}
              onChange={this.handleInputChange} 
            />

            <label>{t('Connection Url')} <span className="required">*</span></label>
            <textarea
              className="form-input"
              rows="4"
              type="text" 
              name="connectionUrl" 
              value={this.state.connectionUrl}
              onChange={this.handleInputChange} >
            </textarea>
          </div>
        </Modal>

        <Modal 
          open={showConfirmDeletionPanel}
          onCancel={this.closeConfirmDeletionPanel}
          onOk={this.confirmDelete}
          title={t('Confirm Deletion')}
          okText={t('Delete')} >
          <div className="confirm-deletion-panel">
            {t('Are you sure you want to delete')} {objectToDelete.name}?
          </div>
        </Modal>
      </div>
    );
  }
}

export default (withTranslation()(DataSource));


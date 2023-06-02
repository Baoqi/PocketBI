import React from 'react';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {deleteOneRecord, getFullRecordList} from "../../api/PocketBaseApi";
import {Modal} from "antd";

const SHARED_REPORT_TABLE_HEADERS = ['Name', 'Type', 'Created By', 'Create Date', 'Share Key', 'Actions'];

class SharedReportView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sharedReportRows: [],
            showConfirmDeletionPanel: false,
            objectToDelete: {}
        };
    }

    componentDidMount() {
        this.fetchSharedReportsRows();
    }

    fetchSharedReportsRows = () => {
        getFullRecordList('vis_shared_report', {
            expand: 'report_id,created_by'
        })
            .then(res => {
                const sharedReportRows = res;
                this.setState({
                    sharedReportRows: sharedReportRows
                });
            });
    }

    openSharedReport = (shareKey) => {
        const url = `/shared_report?$shareKey=${shareKey}`;
        window.open(url, '_blank');
    }

    confirmDelete = () => {
        const {
            objectToDelete = {}
        } = this.state;
        deleteOneRecord('vis_shared_report', objectToDelete.id)
            .then(res => {
                this.fetchSharedReportsRows();
                this.closeConfirmDeletionPanel();
            });
    }

    openConfirmDeletionPanel = (sharedReport) => {
        this.setState({
            objectToDelete: sharedReport,
            showConfirmDeletionPanel: true
        });
    }

    closeConfirmDeletionPanel = () => {
        this.setState({
            objectToDelete: {},
            showConfirmDeletionPanel: false
        });
    }

    render() {
        const { t } = this.props;

        const {
            sharedReportRows = [],
            showConfirmDeletionPanel,
            objectToDelete = {}
        } = this.state;

        const sharedReportHeaderItems = SHARED_REPORT_TABLE_HEADERS.map((header, index) =>
            <th key={index}>{t(header)}</th>
        );

        const sharedReportRowItems = sharedReportRows.map((sharedReport, index) =>
            <tr key={sharedReport.id}>
                <td>{sharedReport?.expand?.report_id?.name}</td>
                <td>{t('Canned')}</td>
                <td>{sharedReport?.expand?.created_by?.email}</td>
                <td>{sharedReport.created}</td>
                <td>{sharedReport.id}</td>
                <td style={{width: '50px'}}>
                    <div className="float-right">
                        <button className="icon-button card-icon-button" onClick={() => this.openSharedReport(sharedReport.id)}>
                            <FontAwesomeIcon icon="tv"  />
                        </button>
                        <button className="icon-button card-icon-button" onClick={() => this.openConfirmDeletionPanel(sharedReport)}>
                            <FontAwesomeIcon icon="trash-alt"  />
                        </button>
                    </div>
                </td>
            </tr>
        );

        return (
            <div className="full-page-content">
                <div style={{marginBottom: '10px', fontSize: '20px'}}>
                    {t('Shared Reports')}
                </div>
                <div className="poli-table-panel">
                    <table className="poli-table">
                        <thead>
                        <tr>
                            {sharedReportHeaderItems}
                        </tr>
                        </thead>
                        <tbody>
                        {sharedReportRowItems}
                        </tbody>
                    </table>
                </div>

                <Modal
                    open={showConfirmDeletionPanel}
                    onCancel={this.closeConfirmDeletionPanel}
                    title={t('Confirm Deletion')}
                    onOk={this.confirmDelete}
                    okText={t('Delete')}
                >
                    <div className="confirm-deletion-panel">
                        {t('Are you sure you want to delete')} {objectToDelete?.expand?.report_id?.name}?
                    </div>
                </Modal>
            </div>
        );
    };
}

export default (withTranslation()(SharedReportView));
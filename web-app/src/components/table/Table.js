import React from 'react';
import PropTypes from 'prop-types';
import { Table as AntdTable } from 'antd';

function Table(props) {
  const {
    data = [],
    columns = [],
    drillThrough = [],
    defaultPageSize = 10,
    showPagination = true,
    errorMsg,
    onTableTdClick
  } = props;

  const handleTdClick = (reportId, columnName, columnValue) => {
    onTableTdClick(reportId, columnName, columnValue);
  }

  const columnHeaders = [];
  columns.forEach(column => {
    const columnName = column.name;
    const header = {
      title: columnName.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      dataIndex: columnName,
      key: columnName,
      ellipsis: true
    };
    if (drillThrough?.length > 0) {
      const index = drillThrough.findIndex(d => d.columnName === columnName);
      if (index !== -1) {
        const reportId = drillThrough[index].reportId;
        header.render = (text =>
                <span className="link-label"
                      onClick={() => handleTdClick(reportId, columnName, text)}>
                  {text}
                </span>
        );
      }
    }

    columnHeaders.push(header);
  });

  if (errorMsg) {
    return (
        <div>{errorMsg}</div>
    );
  }

  return (
      <AntdTable
          dataSource={data}
          columns={columnHeaders}
          size='small'
          pagination={showPagination && data?.length > Number(defaultPageSize) ? {pageSize: Number(defaultPageSize)} : false}
      />);
}

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  defaultPageSize: PropTypes.number,
  drillThrough: PropTypes.array,
  showPagination: PropTypes.bool,
  height: PropTypes.number,
  errorMsg: PropTypes.string
};

export default Table;

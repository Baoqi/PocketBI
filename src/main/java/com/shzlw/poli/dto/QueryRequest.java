package com.shzlw.poli.dto;

import com.shzlw.poli.model.JdbcDataSourcePB;

import java.util.List;

public class QueryRequest {

    private JdbcDataSourcePB jdbcDataSource;
    private List<FilterParameter> filterParams;
    private String sqlQuery;
    private int resultLimit;

    public QueryRequest() {}

    public JdbcDataSourcePB getJdbcDataSource() {
        return jdbcDataSource;
    }

    public void setJdbcDataSource(JdbcDataSourcePB jdbcDataSource) {
        this.jdbcDataSource = jdbcDataSource;
    }

    public List<FilterParameter> getFilterParams() {
        return filterParams;
    }

    public void setFilterParams(List<FilterParameter> filterParams) {
        this.filterParams = filterParams;
    }

    public String getSqlQuery() {
        return sqlQuery;
    }

    public void setSqlQuery(String sqlQuery) {
        this.sqlQuery = sqlQuery;
    }

    public int getResultLimit() {
        return resultLimit;
    }

    public void setResultLimit(int resultLimit) {
        this.resultLimit = resultLimit;
    }
}

package com.shzlw.poli.dto;

import com.shzlw.poli.model.JdbcDataSourcePB;

public class QueryRequest {

    private JdbcDataSourcePB jdbcDataSource;
    private String sqlQuery;
    private int resultLimit;

    public QueryRequest() {}

    public JdbcDataSourcePB getJdbcDataSource() {
        return jdbcDataSource;
    }

    public void setJdbcDataSource(JdbcDataSourcePB jdbcDataSource) {
        this.jdbcDataSource = jdbcDataSource;
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

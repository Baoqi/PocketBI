package com.shzlw.poli.rest;

import com.shzlw.poli.dao.ComponentDao;
import com.shzlw.poli.dto.FilterParameter;
import com.shzlw.poli.dto.QueryRequest;
import com.shzlw.poli.dto.QueryResult;
import com.shzlw.poli.dto.Table;
import com.shzlw.poli.model.Component;
import com.shzlw.poli.model.JdbcDataSourcePB;
import com.shzlw.poli.service.JdbcDataSourceService;
import com.shzlw.poli.service.JdbcQueryService;
import com.shzlw.poli.service.ReportService;
import com.shzlw.poli.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.sql.DataSource;
import java.util.List;

@RestController
@RequestMapping("/ws/jdbcquery")
public class JdbcQueryWs {

    private static final Logger LOGGER = LoggerFactory.getLogger(JdbcQueryWs.class);

    @Autowired
    JdbcDataSourceService jdbcDataSourceService;

    @Autowired
    JdbcQueryService jdbcQueryService;

    @Autowired
    ComponentDao componentDao;

    @Autowired
    ReportService reportService;

    @RequestMapping(value = "/query", method = RequestMethod.POST)
    public QueryResult runQuery(@RequestBody QueryRequest queryRequest) {
        JdbcDataSourcePB dataSourcePB = queryRequest.getJdbcDataSource();
        String sql = queryRequest.getSqlQuery();
        int resultLimit = queryRequest.getResultLimit();

        DataSource dataSource = jdbcDataSourceService.getDataSource(dataSourcePB);
        QueryResult queryResult = jdbcQueryService.queryByParams(dataSource, sql, queryRequest.getFilterParams(), resultLimit);
        return queryResult;
    }

    @RequestMapping(value = "/schema",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Table> getSchema(@RequestBody JdbcDataSourcePB dataSourcePB) {
        DataSource dataSource = jdbcDataSourceService.getDataSource(dataSourcePB);
        return jdbcQueryService.getSchema(dataSource);
    }

    @RequestMapping(
            value = "/component/{id}",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QueryResult> queryComponent(
            @PathVariable("id") long componentId,
            @RequestBody List<FilterParameter> filterParams,
            HttpServletRequest request
    ) {
        Component component = componentDao.findById(componentId);
        if (component.getJdbcDataSourceId() == 0) {
            return new ResponseEntity(QueryResult.ofError(Constants.ERROR_NO_DATA_SOURCE_FOUND), HttpStatus.OK);
        }

        String sql = component.getSqlQuery();
        DataSource dataSource = jdbcDataSourceService.getDataSource(component.getJdbcDataSourceId());
        QueryResult queryResult = jdbcQueryService.queryByParams(dataSource, sql, filterParams, Constants.QUERY_RESULT_NOLIMIT);
        return new ResponseEntity(queryResult, HttpStatus.OK);
    }
}

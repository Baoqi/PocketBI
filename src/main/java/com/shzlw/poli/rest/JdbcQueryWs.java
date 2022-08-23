package com.shzlw.poli.rest;

import com.shzlw.poli.dto.QueryRequest;
import com.shzlw.poli.dto.QueryResult;
import com.shzlw.poli.dto.Table;
import com.shzlw.poli.model.JdbcDataSourcePB;
import com.shzlw.poli.service.JdbcDataSourceService;
import com.shzlw.poli.service.JdbcQueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

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

    @RequestMapping(value = "/ping",
            method = RequestMethod.POST)
    public String ping(@RequestBody JdbcDataSourcePB dataSourcePB) {
        DataSource dataSource = jdbcDataSourceService.getDataSource(dataSourcePB);
        return jdbcQueryService.ping(dataSource, dataSourcePB.getPing());
    }
}

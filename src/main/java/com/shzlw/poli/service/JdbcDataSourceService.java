package com.shzlw.poli.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.RemovalListener;
import com.shzlw.poli.config.AppProperties;
import com.shzlw.poli.model.JdbcDataSourcePB;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.sql.DataSource;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class JdbcDataSourceService {

    // 10 seconds
    private static final int LEAK_DETECTION_THRESHOLD = 10000;

    /**
     * Key: JdbcDataSource id
     * Value: HikariDataSource
     */
    private static final Cache<String, HikariDataSource> DATA_SOURCE_CACHE = CacheBuilder.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .removalListener((RemovalListener<String, HikariDataSource>) removal -> {
                HikariDataSource ds = removal.getValue();
                ds.close();
            })
            .build();


    @Autowired
    AppProperties appProperties;

    @PostConstruct
    public void init() {
    }

    @PreDestroy
    public void shutdown() {
        for (HikariDataSource hiDs : DATA_SOURCE_CACHE.asMap().values()) {
            hiDs.close();
        }
    }

    public void removeFromCache(long dataSourceId) {
        DATA_SOURCE_CACHE.invalidate(dataSourceId);
    }

    public DataSource getDataSource(JdbcDataSourcePB dataSource) {
        try {
            DataSource hiDs = DATA_SOURCE_CACHE.get(dataSource.getId(), () -> {
                HikariDataSource newHiDs = new HikariDataSource();
                newHiDs.setJdbcUrl(dataSource.getConnectionUrl());
                newHiDs.setUsername(dataSource.getUsername());
                newHiDs.setPassword(dataSource.getPassword());
                if (!StringUtils.isEmpty(dataSource.getDriverClassName())) {
                    newHiDs.setDriverClassName(dataSource.getDriverClassName());
                }
                newHiDs.setMaximumPoolSize(appProperties.getDatasourceMaximumPoolSize());
                newHiDs.setLeakDetectionThreshold(LEAK_DETECTION_THRESHOLD);
                return newHiDs;
            });
            return hiDs;
        } catch (ExecutionException | CacheLoader.InvalidCacheLoadException e) {
            return null;
        }
    }
}

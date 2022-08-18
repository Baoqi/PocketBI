package com.shzlw.poli.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.shzlw.poli.dao.ReportDao;
import com.shzlw.poli.model.Report;
import com.shzlw.poli.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class ReportService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ReportService.class);

    private static final Cache<Long, List<Report>> USER_REPORT_CACHE = CacheBuilder.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .build();

    @Autowired
    ReportDao reportDao;

    public List<Report> getAllReports() {
        try {
            return USER_REPORT_CACHE.get(0L, () -> reportDao.findAll());
        } catch (ExecutionException | CacheLoader.InvalidCacheLoadException e) {
            return Collections.emptyList();
        }
    }

    public void invalidateCache() {
        USER_REPORT_CACHE.invalidate(0L);
    }
}

package com.shzlw.poli.rest;

import com.shzlw.poli.model.Component;
import com.shzlw.poli.model.Report;
import com.shzlw.poli.service.ReportService;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;

import javax.servlet.http.HttpServletRequest;

@RunWith(MockitoJUnitRunner.class)
public class JdbcQueryWsTest {

    @InjectMocks
    @Spy
    JdbcQueryWs jdbcQueryWs;

    @Mock
    ReportService reportService;

    @Mock
    Component component;

    @Mock
    HttpServletRequest request;

    @Mock
    Report report;

}

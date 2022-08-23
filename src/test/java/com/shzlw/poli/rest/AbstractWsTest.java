package com.shzlw.poli.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

public abstract class AbstractWsTest {

    public static final String REPORTS_BASE_URL = "/ws/reports";
    public static final String COMPONENTS_BASE_URL = "/ws/components";
    public static final String JDBCDATASOURCES_BASE_URL = "/ws/jdbcdatasources";

    @Autowired
    ObjectMapper mapper;

    @Autowired
    MockMvc mvc;

    MvcResult mvcResult;

    public AbstractWsTest() {
    }
}

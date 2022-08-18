package com.shzlw.poli.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shzlw.poli.model.Component;
import com.shzlw.poli.model.Report;
import com.shzlw.poli.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public abstract class AbstractWsTest {

    public static final String CANNEDREPORTS_BASE_URL = "/ws/cannedreports";
    public static final String REPORTS_BASE_URL = "/ws/reports";
    public static final String COMPONENTS_BASE_URL = "/ws/components";
    public static final String JDBCDATASOURCES_BASE_URL = "/ws/jdbcdatasources";

    @Autowired
    ObjectMapper mapper;

    @Autowired
    MockMvc mvc;

    MvcResult mvcResult;
    String responeText;
    Cookie[] cookies;

    public AbstractWsTest() {
    }

    public long createReport(String name) throws Exception {
        Report newReport = new Report();
        newReport.setName(name);
        newReport.setStyle("{}");
        String body = mapper.writeValueAsString(newReport);

        mvcResult = mvc.perform(
                post("/ws/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
                .andExpect(status().isCreated())
                .andReturn();
        long id = Long.parseLong(mvcResult.getResponse().getContentAsString());
        return id;
    }

    public long createComponent(long reportId) throws Exception {
        Component w1 = new Component();
        w1.setTitle("w1");
        w1.setX(1);
        w1.setY(2);
        w1.setWidth(3);
        w1.setHeight(4);
        w1.setType(Constants.COMPONENT_TYPE_CHART);
        w1.setSubType("table");
        w1.setReportId(reportId);
        w1.setData("{}");
        w1.setStyle("{}");
        w1.setDrillThrough("[]");

        String body = mapper.writeValueAsString(w1);

        mvcResult = mvc.perform(
                post("/ws/components")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        )
                .andExpect(status().isCreated())
                .andReturn();
        long id = Long.parseLong(mvcResult.getResponse().getContentAsString());
        return id;
    }
}

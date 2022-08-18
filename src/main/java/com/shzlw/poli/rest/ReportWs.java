package com.shzlw.poli.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shzlw.poli.config.AppProperties;
import com.shzlw.poli.dao.ComponentDao;
import com.shzlw.poli.dao.ReportDao;
import com.shzlw.poli.model.Report;
import com.shzlw.poli.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/ws/reports")
public class ReportWs {

    @Autowired
    ReportDao reportDao;

    @Autowired
    ComponentDao componentDao;

    @Autowired
    ReportService reportService;

    @Autowired
    AppProperties appProperties;

    @Autowired
    ObjectMapper mapper;

    @RequestMapping(method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public List<Report> findAll(HttpServletRequest request) {
        return reportService.getAllReports();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public Report findOneById(@PathVariable("id") long id,
                              HttpServletRequest request) {
        List<Report> reports = findAll(request);
        Report report = reports.stream().filter(d -> d.getId() == id).findFirst().orElse(null);
        return report;
    }

    @RequestMapping(value = "/name/{name}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public Report findOneByName(@PathVariable("name") String name,
                                HttpServletRequest request) {
        List<Report> reports = findAll(request);
        return reports.stream().filter(d -> d.getName().equals(name)).findFirst().orElse(null);
    }

    @RequestMapping(method = RequestMethod.POST)
    @Transactional
    public ResponseEntity<Long> add(@RequestBody Report report,
                                    HttpServletRequest request) {
        reportService.invalidateCache();
        long id = reportDao.insert(report.getName(), report.getStyle(), report.getProject());
        return new ResponseEntity<Long>(id, HttpStatus.CREATED);
    }

    @RequestMapping(method = RequestMethod.PUT)
    @Transactional
    public ResponseEntity<?> update(@RequestBody Report report,
                                    HttpServletRequest request) {
        reportService.invalidateCache();
        reportDao.update(report);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @Transactional
    public ResponseEntity<?> delete(@PathVariable("id") long reportId,
                                    HttpServletRequest request) {
        reportService.invalidateCache();
        componentDao.deleteByReportId(reportId);
        reportDao.delete(reportId);
        return new ResponseEntity<String>(HttpStatus.NO_CONTENT);
    }
}

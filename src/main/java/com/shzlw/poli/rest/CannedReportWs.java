package com.shzlw.poli.rest;

import com.shzlw.poli.dao.CannedReportDao;
import com.shzlw.poli.model.CannedReport;
import com.shzlw.poli.util.CommonUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/ws/cannedreports")
public class CannedReportWs {

    @Autowired
    CannedReportDao cannedReportDao;

    @RequestMapping(
            value = "/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public CannedReport one(@PathVariable("id") long id) {
        return cannedReportDao.findById(id);
    }

    @RequestMapping(
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public List<CannedReport> all() {
        return cannedReportDao.findAll();
    }

    @RequestMapping(
            value = "/myreport",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(readOnly = true)
    public List<CannedReport> getMyReport(HttpServletRequest request) {
        return cannedReportDao.findAll();
    }

    @RequestMapping(method = RequestMethod.POST)
    @Transactional
    public ResponseEntity<Long> add(@RequestBody CannedReport cannedReport,
                                    HttpServletRequest request) {
        long id = cannedReportDao.insert(
                CommonUtils.toEpoch(LocalDateTime.now()),
                cannedReport.getName(),
                cannedReport.getData());
        return new ResponseEntity<Long>(id, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @Transactional
    public ResponseEntity<?> delete(@PathVariable("id") long id) {
        cannedReportDao.delete(id);
        return new ResponseEntity<String>(HttpStatus.NO_CONTENT);
    }
}

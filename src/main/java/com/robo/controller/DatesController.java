package com.robo.controller;

import com.robo.Entities.Dates;
import com.robo.repository.DatesRepo;
import com.robo.service.DatesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("dates")
public class DatesController {

    @Autowired
    DatesRepo dr;

    @Autowired
    DatesService ds;

    @GetMapping
    public List<Dates> getAllDates() {
        return dr.findAll();
    }

    @GetMapping("/dateWithNoticeCount")
    public List<Map<String, String>> getDatesWithNoticeCounter(){
        return ds.getDatesWithNoticeCounter();
    }

}
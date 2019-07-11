package com.robo.controller;

import com.robo.DTOModel.MonthlySpendsDTO;
import com.robo.Entities.Dates;
import com.robo.repository.DatesRepo;
import com.robo.service.DatesService;
import com.robo.service.MonthlySpendsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @Autowired
    MonthlySpendsService mss;

    @GetMapping
    public List<Dates> getAllDates() {
        return dr.findAll();
    }

    @GetMapping("/lastDate")
    public Dates getLastDate() { return ds.getLastDate(); }

    @GetMapping("/dateWithNoticeCount")
    public List<Map<String, String>> getDatesWithNoticeCounter(){
        return ds.getDatesWithNoticeCounter();
    }

    @PutMapping("makeNewDate")
    List<MonthlySpendsDTO> makeNewDate() {
        ds.generateDate();
        return mss.getLastMonth();
    }

}
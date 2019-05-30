package com.robo.controller;

import com.robo.Entities.Dates;
import com.robo.repository.DatesRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("dates")
public class DatesController {

    @Autowired
    DatesRepo dr;

    @GetMapping
    public List<Dates> getAllDates() {
        return dr.findAll();
    }

}
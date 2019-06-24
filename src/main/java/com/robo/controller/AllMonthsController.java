package com.robo.controller;

import com.robo.DTOModel.AllMonthsDTO;
import com.robo.service.AllMonthsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("allMonths")
public class AllMonthsController {

    @Autowired
    AllMonthsService ams;

    @GetMapping("{dateId}")
    public List<AllMonthsDTO> getMonthDTOByDateId(@PathVariable Integer dateId){
        return ams.getMonthDTOByDateId(dateId);
    }

}

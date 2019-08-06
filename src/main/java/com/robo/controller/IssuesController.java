package com.robo.controller;

import com.robo.service.IssuesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController("issues")
public class IssuesController {

    @Autowired
    IssuesService is;

    @GetMapping("/fixTooManyDatesException/{dateId}")
    public boolean fixTooManyDatesException(@PathVariable Integer dateId) {
        return is.fixTooManyDatesException(dateId);
    }

    @GetMapping("/fixDateWOSpendsException/{dateId}")
    public boolean fixDateWOSpendsException(@PathVariable Integer dateId) {
        return is.fixDateWOSpendsException(dateId);
    }
}

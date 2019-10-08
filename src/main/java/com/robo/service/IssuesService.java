package com.robo.service;

import com.robo.Entities.Dates;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.DatesRepo;
import com.robo.repository.MonthlySpendsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IssuesService {

    @Autowired
    DatesRepo dr;

    @Autowired
    MonthlySpendsRepo msr;

//    DATES START
    public boolean fixTooManyDatesException(Integer dateId) {
        Dates date = dr.findOneById(dateId).orElseThrow(NotFoundException::new);
        String duplicatedYearAndMonth = date.getDate().toString().substring(0, 7);
        if (dr.findAll().stream()
                .anyMatch(item ->
                        item.getDate().toString().substring(0, 7).equals(duplicatedYearAndMonth))){//найти в листе dates месяц и год равные сегодняшним
            fixDateWOSpendsException(dateId);
            return true;
        }
        return false;
    }

    public boolean fixDateWOSpendsException(Integer dateId) {
        if (msr.findAllByDateId(dateId).isEmpty()) { // если monthly_spends действительно нет для этого dates
            dr.findOneById(dateId).ifPresent(dates -> dr.delete(dates));
            return true;
        }
        return false;
    }

}

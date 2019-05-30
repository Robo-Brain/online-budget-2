package com.robo.service;

import com.robo.Entities.Dates;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.DatesRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DatesService {

    @Autowired
    DatesRepo dr;

    Dates getTodaysDate() { // метод ищет месяц и год равные сегодняшним, если не находит, то создает новую дату
        String todayYearAndMonth = LocalDate.now().toString().substring(0, 7);
        List<Dates> datesList = dr.findAll();
        List<Dates> result = datesList.stream().filter(item -> item.getDate().toString().substring(0, 7).equals(todayYearAndMonth)).collect(Collectors.toList()); //найти в листе dates месяц и год равные сегодняшним
        System.out.println(result);
        if (result.size() == 1){ // если месяц и год равные сегодняшним найдены - вернуть этот dates
            return result.get(0);
        } else if (result.size() < 1) { // если месяц и год равные сегодняшним НЕ найдены - вернуть новый dates
            return new Dates();
        } else {
            throw new RuntimeException("TOO MANY dates! What's happening???");
        }
        //        return dr.findDistinctFirstByDateBeforeOrderByDateDesc(today).orElse(getLastDate());
    }

    Dates getLastDate() {
        return dr.findTopByOrderByIdDesc().orElse(new Dates());
    }

    void deleteDate(Integer dateId){
        Dates d = dr.findOneById(dateId).orElseThrow(NotFoundException::new);
        dr.delete(d);
    }

//    private Dates findOneDate(){
//       List<Dates> datesList = dr.findAll();
//       if (datesList.size() == 1){
//           return datesList.get(0);
//       } else {
//           return null;
//       }
//
//    }

}

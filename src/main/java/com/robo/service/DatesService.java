package com.robo.service;

import com.robo.Entities.Dates;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.DatesRepo;
import com.robo.repository.MonthlySpendsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DatesService {

    @Autowired
    DatesRepo dr;

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    NoticesService ns;

    Dates getTodaysDate() { // метод ищет месяц и год равные сегодняшним, если не находит, то создает новую дату
        String todayYearAndMonth = LocalDate.now().toString().substring(0, 7);
        List<Dates> datesList = dr.findAll();
        if (datesList.size() > 0) {
            List<Dates> result = datesList.stream().filter(item -> item.getDate().toString().substring(0, 7).equals(todayYearAndMonth)).collect(Collectors.toList()); //найти в листе dates месяц и год равные сегодняшним
            if (result.size() == 1){ // если месяц и год равные сегодняшним найдены - вернуть этот dates
                return result.get(0);
            } else if (result.size() == 0) { // если месяц и год равные сегодняшним НЕ найдены - вернуть новый dates
                return new Dates();
            } else {
                throw new RuntimeException("TOO MANY dates! What's happening???");
            }
        } else {
            msr.deleteAll(); // ACHTUNG !!! тестовая фигня, не знаю, нужна ли, но, по идее, если нет дат, то нужно дропнуть всю таблицу monthly_spends // WARNING!!
            return new Dates();
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

    public List<Map<String, String>> getDatesWithNoticeCounter() {
        List<Map<String, String>> result = new ArrayList<>();
        dr.findAll().forEach(date -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", String.valueOf(date.getId()));
            map.put("date", date.getDate().toString());
            map.put("noticeQuantity", String.valueOf(ns.getNoticeCountForDateId(date.getId())));
            result.add(map);
        });
        return result;
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

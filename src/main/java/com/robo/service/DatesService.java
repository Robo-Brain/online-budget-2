package com.robo.service;

import com.robo.Entities.Dates;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.DatesRepo;
import com.robo.repository.MonthlySpendsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DatesService {

    @Autowired
    DatesRepo dr;

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    NoticesService ns;

    public Dates getTodaysDate() { // метод ищет месяц и год равные сегодняшним, если не находит, то создает новую дату
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
            return new Dates();
        }
    }

    public Dates getLastDate() {
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

    private java.sql.Date makeNewDate() { //метод собирает дату по кусочкам исходя из текущей даты
        LocalDate date = LocalDate.now();
//        Dates lastDate = dr.findTopByOrderByIdDesc().orElse(new Dates());
//        if (lastDate.getDate().getMonth() )
        if (date.getMonthValue() == 12) {
            date = date.plusYears(1);
            date = date.withMonth(1);
        }
        else {
            date = date.plusMonths(1);
        }
        date = date.plusDays(1); //БД уменьшает все на день из-за таймзоны, потом удалю эту строку, как разберусь с БД
        return java.sql.Date.valueOf(date);
    }

    public Dates generateDate() { //метод создает Dates и записывает в БД
        Dates date = getTodaysDate(); //получить сегодняшнюю дату или пустую
        if (Objects.isNull(date.getId())) { // все ок, сегодняшней даты в базе нет, календарный месяц завершен
            date.setDate(java.sql.Date.valueOf(LocalDate.now().plusDays(1)));
            date.setCompleted(false);
            dr.save(date);
        } else { // сегодняшняя дата в базе есть, календарный месяц не завершен
            if (msr.findAllByDateId(date.getId()).isPresent()){ // сегодняшняя дата найдена и для нее есть платежи, значит создается следующий месяц, все ок, новую дату НУЖНО создать
                date = new Dates();
                date.setDate(makeNewDate());
                date.setCompleted(false);
                dr.save(date);
            } // else сегодняшняя дата найдена и для нее нет платежей, значит заполняется "пустой" месяц, новую дату создавать НЕ нужно
        }
        return date;
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

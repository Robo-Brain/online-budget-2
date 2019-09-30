package com.robo.service;

import com.robo.Entities.MonthAmountHistory;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.MonthAmountHistoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.Time;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MonthAmountHistoryService {

    @Autowired
    MonthAmountHistoryRepo mahr;

//    public List<MonthAmountHistoryDTO> getAmountHistoryByMonthlySpendsId(Integer monthlySpendsId) {
//        List<MonthAmountHistory> mahList = mahr.findAllByMonthlySpendsId(monthlySpendsId);
//
//        TreeSet<java.sql.Date> dates = new TreeSet<>();
//        mahList.stream().filter(p -> dates.add(p.getDate())).collect(Collectors.toList());
//
//        List<MonthAmountHistoryDTO> mahDTOList = new ArrayList<>();
//
//        dates.forEach(date -> {
//            MonthAmountHistoryDTO mahDTO = new MonthAmountHistoryDTO();
//            mahDTO.setDate(date);
//            mahDTO.setMap(
//                    mahList.stream()
//                            .filter(mah -> mah.getDate().equals(date))
//                            .collect(Collectors.toMap(MonthAmountHistory::getTime, MonthAmountHistory::getAmount)));
//
//            mahDTOList.add(mahDTO);
//        });
//
//        return mahDTOList;
//    }

    List<MonthAmountHistory> findAllByMonthlySpendsIdAndPlusOneDay(Integer monthlySpendsId) {
        List<MonthAmountHistory> mahList = mahr.findAllByMonthlySpendsId(monthlySpendsId);
        return mahList.stream().peek(mah -> {
            LocalDate date = mah.getDate().toLocalDate();
            date = date.plusDays(1);
            mah.setDate(java.sql.Date.valueOf(date));
        }).collect(Collectors.toList());
    }

    public Map<Date, List<MonthAmountHistory>> getAmountHistoryByMonthlySpendsId(Integer monthlySpendsId){
        List<MonthAmountHistory> mahList = findAllByMonthlySpendsIdAndPlusOneDay(monthlySpendsId);
        Map<Date, List<MonthAmountHistory>> result = new LinkedHashMap<>();
        mahList.forEach(mah -> result.put(mah.getDate(), new ArrayList<>()));
        mahList.forEach(mah -> result.get(mah.getDate()).add(mah));
        return result;
    }

    void addNewHistoryElement(Integer monthlySpendsId, Integer newAmount) {
        List<MonthAmountHistory> historyListForMonthlySpendsId = mahr.findAllByMonthlySpendsId(monthlySpendsId);

        Calendar cal = Calendar.getInstance();
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");

        java.util.Date time = cal.getTime();//fkin heroku have no timezone UTC+5
        time.setHours(time.getHours() + 5);

        if (historyListForMonthlySpendsId.isEmpty()
                || historyListForMonthlySpendsId.stream()
                .noneMatch(history -> history.getAmount() >= newAmount)){ // если нет истории для этого monthlySpendsId, то сохранить "не глядя" или если старая сумма НЕ МЕНЬШЕ новой
            MonthAmountHistory mah = new MonthAmountHistory();
            mah.setDate(Date.valueOf(LocalDate.now()));
            mah.setTime(Time.valueOf(sdf.format(time.getTime())));
            mah.setMonthlySpendsId(monthlySpendsId);
            mah.setAmount(newAmount);
            mahr.save(mah);
        }
    }

    public void setCommentToAmountHistoryElement(Integer historyAmountId, String comment) {
        MonthAmountHistory mah = mahr.findById(historyAmountId).orElseThrow(NotFoundException::new);
        mah.setComment(comment);
        mahr.save(mah);
    }

    public Map<Date, List<MonthAmountHistory>> deleteHistoryElement(Integer historyAmountId) {
        MonthAmountHistory mah = mahr.findById(historyAmountId).orElseThrow(NotFoundException::new);
        Integer monthlySpendId = mah.getMonthlySpendsId();
        mahr.delete(mah);
        return getAmountHistoryByMonthlySpendsId(monthlySpendId);
    }
}

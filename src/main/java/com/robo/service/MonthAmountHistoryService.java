package com.robo.service;

import com.robo.DTOModel.MonthAmountHistoryDTO;
import com.robo.Entities.MonthAmountHistory;
import com.robo.repository.MonthAmountHistoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.Time;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
public class MonthAmountHistoryService {

    @Autowired
    MonthAmountHistoryRepo mahr;

    public List<MonthAmountHistoryDTO> getAmountHistoryByMonthlySpendsId(Integer monthlySpendsId) {
        List<MonthAmountHistory> mahList = mahr.findAllByMonthlySpendsId(monthlySpendsId);

        TreeSet<java.sql.Date> dates = new TreeSet<>();
        mahList.stream().filter(p -> dates.add(p.getDate())).collect(Collectors.toList());

        List<MonthAmountHistoryDTO> mahDTOList = new ArrayList<>();

        dates.forEach(date -> {
            MonthAmountHistoryDTO mahDTO = new MonthAmountHistoryDTO();
            mahDTO.setDate(date);
            mahDTO.setMap(
                    mahList.stream()
                            .filter(mah -> mah.getDate().equals(date))
                            .collect(Collectors.toMap(MonthAmountHistory::getTime, MonthAmountHistory::getAmount)));

            mahDTOList.add(mahDTO);
        });

        return mahDTOList;
    }

    public void addNewHistoryElement(Integer monthlySpendsId, Integer newAmount) {
        MonthAmountHistory mah = new MonthAmountHistory();

        Calendar cal = Calendar.getInstance();
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");

        java.util.Date time = cal.getTime();//fkin heroku have no timezone UTC+5
        time.setHours(time.getHours() + 5);

        mah.setDate(Date.valueOf(LocalDate.now()));
        mah.setTime(Time.valueOf(sdf.format(time.getTime())));
        mah.setMonthlySpendsId(monthlySpendsId);
        mah.setAmount(newAmount);

        mahr.save(mah);
    }
}

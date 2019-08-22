package com.robo.service;

import com.robo.DTOModel.MonthAmountHistoryDTO;
import com.robo.Entities.MonthAmountHistory;
import com.robo.repository.MonthAmountHistoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

}

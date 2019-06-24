package com.robo.service;

import com.robo.DTOModel.AllMonthsDTO;
import com.robo.Entities.MonthlySpends;
import com.robo.repository.MonthlySpendsRepo;
import com.robo.repository.NoticesRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AllMonthsService {

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    MonthlySpendsService mss;

    @Autowired
    NoticesRepo nr;

    public List<AllMonthsDTO> getMonthDTOByDateId(Integer dateId){
        List<MonthlySpends> msList = mss.getMonthlySpendsByDateId(dateId);
        List<AllMonthsDTO> allMonthsDTO = new ArrayList<>();
        msList.forEach(ms -> {
            AllMonthsDTO amDTO = new AllMonthsDTO();
            Integer monthlySpendId = ms.getId();

            amDTO.setDateId(ms.getDateId());
            amDTO.setMonthlySpendsId(monthlySpendId);
            amDTO.setDate(ms.getDates().getDate());
            amDTO.setTemplateId(ms.getTemplateId());
            amDTO.setSpendName(ms.getTemplates().getSpends().getName());
            amDTO.setTemplateAmount(ms.getTemplates().getAmount());
            amDTO.setMonthAmount(ms.getMonthAmount());
            amDTO.setCash(ms.getTemplates().isCash());
            amDTO.setSalary(ms.getTemplates().isSalary());
            amDTO.setHaveNotice(!nr.findAllByMonthlySpendId(monthlySpendId).isEmpty());

            allMonthsDTO.add(amDTO);
        });
        return allMonthsDTO;
    }

}

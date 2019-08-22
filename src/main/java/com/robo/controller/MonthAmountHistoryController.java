package com.robo.controller;

import com.robo.DTOModel.MonthAmountHistoryDTO;
import com.robo.service.MonthAmountHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("monthAmountHistory")
public class MonthAmountHistoryController {

    @Autowired
    MonthAmountHistoryService mahs;

    @GetMapping("/{monthlySpendId}")
    public List<MonthAmountHistoryDTO> getAmountHistoryByMonthlySpendsId(@PathVariable Integer monthlySpendId) {
        return mahs.getAmountHistoryByMonthlySpendsId(monthlySpendId);
    }

}
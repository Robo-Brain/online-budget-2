package com.robo.controller;

import com.robo.Entities.MonthAmountHistory;
import com.robo.service.MonthAmountHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("monthAmountHistory")
public class MonthAmountHistoryController {

    @Autowired
    MonthAmountHistoryService mahs;

    @GetMapping("/{monthlySpendId}")
    public Map<Date, List<MonthAmountHistory>> getAmountHistoryByMonthlySpendsId(@PathVariable Integer monthlySpendId) {
        return mahs.getAmountHistoryByMonthlySpendsId(monthlySpendId);
    }

    @PostMapping
    public void setCommentToAmountHistoryElement(@RequestParam(name = "historyAmountId") Integer historyAmountId,
                                                 @RequestParam(name = "comment") String comment) {
        mahs.setCommentToAmountHistoryElement(historyAmountId, comment);
    }

}
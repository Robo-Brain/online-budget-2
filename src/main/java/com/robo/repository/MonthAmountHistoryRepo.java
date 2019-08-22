package com.robo.repository;

import com.robo.Entities.MonthAmountHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MonthAmountHistoryRepo extends JpaRepository<MonthAmountHistory, Integer> {

    List<MonthAmountHistory> findAllByMonthlySpendsId(Integer id);

    List<MonthAmountHistory> findAllByMonthlySpendsIdAndDate(Integer id, java.sql.Date date);
}

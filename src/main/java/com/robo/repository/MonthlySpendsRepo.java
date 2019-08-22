package com.robo.repository;

import com.robo.Entities.MonthlySpends;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MonthlySpendsRepo extends JpaRepository<MonthlySpends, Integer> {

    Optional<List<MonthlySpends>> findAllByDateId(Integer dateId);

    Optional<List<MonthlySpends>> findAllByDateIdAndTemplateId(Integer dateId, Integer templateId);

    Optional<MonthlySpends> findOneById(Integer dateId);

    List<MonthlySpends> findAllByTemplateId(Integer templateId);

    MonthlySpends findTopByOrderByIdDesc();
}

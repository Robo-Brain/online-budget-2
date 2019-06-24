package com.robo.repository;

import com.robo.Entities.Notices;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticesRepo extends JpaRepository<Notices, Integer> {
    List<Notices> findAllById(Integer monthlySpendId);

    List<Notices> findAllByMonthlySpendId(Integer monthlySpendId);

    List<Notices> findAllByRemind(Boolean remind);
}

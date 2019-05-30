package com.robo.repository;

import com.robo.Entities.Spends;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SpendsRepo extends JpaRepository<Spends, Integer> {

    @Query("SELECT s FROM Spends s ORDER BY s.name ASC")
    List<Spends> findAllOrderByNameAsc();

    Spends findAllById(Integer spendId);

    Spends findOneById(Integer spendId);
}

package com.robo.repository;

import com.robo.Entities.Templates;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TemplatesRepo extends JpaRepository<Templates, Integer> {
    Optional<Templates> findOneById(Integer templateId);

    Optional<List<Templates>> findBySpendId(Integer spendId);

//    @Query("SELECT t FROM Templates t WHERE t.spendId = ?1 AND t.isSalary = ?2 AND t.isCash = ?3")
//    Optional<List<Templates>> findSameTemplate(Integer spendId, Boolean isSalary, Boolean isCash);

    @Query("SELECT t FROM Templates t WHERE t.spendId = ?1 AND t.amount = ?2 AND t.isSalary = ?3 AND t.isCash = ?4")
    Optional<List<Templates>> findSameTemplate(Integer spendId, Integer amount, Boolean isSalary, Boolean isCash);
}

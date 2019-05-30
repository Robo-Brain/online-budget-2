package com.robo.repository;

import com.robo.Entities.Templates;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TemplatesRepo extends JpaRepository<Templates, Integer> {
    Optional<Templates> findOneById(Integer templateId);

    Optional<List<Templates>> findBySpendId(Integer spendId);

    @Query("SELECT t FROM Templates t WHERE t.spendId = ?1 AND t.amount = ?2 AND t.cashOrCard = ?3 AND t.salaryOrPrepaid = ?4")
    Optional<Templates> findSameSpend(Integer spendId, Integer amount, Boolean salaryOrPrepaid, Boolean cashOrCard);
}

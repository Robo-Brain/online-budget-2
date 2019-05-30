package com.robo.repository;

import com.robo.Entities.TemplatesList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TemplatesListRepo extends JpaRepository<TemplatesList, Integer> {

    Optional<TemplatesList> findOneById(Integer templateId);

    Optional<List<TemplatesList>> findAllByEnabledTrue();

    @Query("SELECT t FROM TemplatesList t WHERE t.enabled = 1")
    Optional<TemplatesList> findEnabled();
}

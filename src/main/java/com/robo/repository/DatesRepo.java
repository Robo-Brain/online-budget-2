package com.robo.repository;

import com.robo.Entities.Dates;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DatesRepo extends JpaRepository<Dates, Integer> {

    Optional<Dates> findDistinctFirstByDateBeforeOrderByDateDesc(LocalDate date);

    Optional<Dates> findOneById(Integer id);

    Optional<Dates> findTopByOrderByIdDesc();

    List<Dates> findAllByDate(LocalDate date);

}

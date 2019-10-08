package com.robo.repository;

import com.robo.Entities.Dates;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DatesRepo extends JpaRepository<Dates, Integer> {

    Optional<Dates> findDistinctFirstByDateBeforeOrderByDateDesc(LocalDate date);

    Optional<Dates> findOneById(Integer id);

    Optional<Dates> findTopByOrderByIdDesc();

    List<Dates> findAllByDate(LocalDate date);

    List<Dates> findAllByTemplateListId(Integer templatesListId);

    @Query("SELECT d.id FROM Dates d WHERE d.id < :dateId ORDER BY d.id DESC")// вернуть все записи с id меньше указанного
    List<Integer> getPreviousDateIdRow(@Param("dateId") Integer dateId);

    @Query("SELECT d.id FROM Dates d ORDER BY d.id DESC")// вернуть записи id в порядке возрастания даты создания
    List<Integer> getOrderedDatesIdRow();
}

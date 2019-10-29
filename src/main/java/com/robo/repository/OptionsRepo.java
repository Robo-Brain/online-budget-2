package com.robo.repository;

import com.robo.Entities.Options;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OptionsRepo extends JpaRepository<Options, Integer> {

    Optional<Options> findOneByUserId(String userId);
}

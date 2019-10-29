package com.robo.repository;

import com.robo.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, String> {

    @Override
    Optional<User> findById(String id);

    Optional<User> findByName(String name);
}

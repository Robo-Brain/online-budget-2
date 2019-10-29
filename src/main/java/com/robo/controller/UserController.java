package com.robo.controller;

import com.robo.Entities.User;
import com.robo.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("user")
public class UserController {

    @Autowired
    UserRepo ur;

    @GetMapping
    public User getUser(Principal principal) {
        return (User) ((Authentication) principal).getPrincipal();
    }

}
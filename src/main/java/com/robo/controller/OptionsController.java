package com.robo.controller;

import com.robo.Entities.Options;
import com.robo.Entities.User;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.OptionsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("options")
public class OptionsController {

    @Autowired
    OptionsRepo or;

    @GetMapping
    public Options getProperties(Principal principal) {
        User loginedUser = (User) ((Authentication) principal).getPrincipal();
        Optional<Options> opt = or.findOneByUserId(loginedUser.getId());
        if (opt.isPresent()){
            if(opt.get().getProperties().equals("{}")) {
                opt.get().setProperties("{\"templates_ignore\": [], \"color_scheme\" : \"default\"}");
                or.save(opt.get());
            }
            return opt.get();
        } else {
            Options options = new Options();
            options.setUserId(loginedUser.getId());
            options.setProperties("{\"templates_ignore\": \"[]\", \"color_scheme\" : \"default\"}");
            or.save(options);
            return options;
        }
    }

    @PutMapping("/setProperties")
    public void setProperties(@RequestBody String requestString, Principal principal) {
        try {
            JSONObject jsonObj = new JSONObject(requestString);
            String jsonUserID = jsonObj.get("userId").toString();
            String properties = jsonObj.get("properties").toString();

            User loginedUser = (User) ((Authentication) principal).getPrincipal();
            if (loginedUser.getId().equals(jsonUserID)){
                Options options = or.findOneByUserId(loginedUser.getId()).orElseThrow(NotFoundException::new);
                options.setProperties(properties);
                or.save(options);
            } else System.out.println("User ID from frontend !equal user ID from session.");
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

}
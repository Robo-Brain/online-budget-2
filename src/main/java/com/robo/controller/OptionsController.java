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

@RestController
@RequestMapping("options")
public class OptionsController {

    @Autowired
    OptionsRepo or;

    @GetMapping
    public Options getProperties(Principal principal) {
        User loginedUser = (User) ((Authentication) principal).getPrincipal();
        if (or.findOneByUserId(loginedUser.getId()).isPresent()){
            return or.findOneByUserId(loginedUser.getId()).get();
        } else {
            Options opt = new Options();
            opt.setUserId(loginedUser.getId());
            opt.setProperties("{}");
            or.save(opt);
            return opt;
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
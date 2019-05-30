package com.robo.controller;

import com.robo.DTOModel.TemplatesListDTO;
import com.robo.Entities.TemplatesList;
import com.robo.Entities.User;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.TemplatesListRepo;
import com.robo.service.TemplatesListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("templatesList")
public class TemplatesListController {

    @Autowired
    TemplatesListRepo tlr;

    @Autowired
    TemplatesListService tls;

    private ThreadLocal<User> userSession = new ThreadLocal<>();

    //           TEMPLATES LIST.start

    @GetMapping
    public List<TemplatesListDTO> getAllTemplatesList(){ //получить все листы из templates_list
        return tls.getTemplatesList();
    }

    @GetMapping("{id}")
    public TemplatesList getOneTemplatesList(@PathVariable Integer id){ //получить один лист из templates_list по id
        return tlr.findOneById(id).orElseThrow(NotFoundException::new);
    }

    @PostMapping("activate={id}")
    public List<TemplatesListDTO> activateTemplatesList(@PathVariable Integer id){
        tls.makeTemplateWithIdActive(id);
        return getAllTemplatesList();
    }

    @PutMapping("create")
    public List<TemplatesListDTO> createTemplatesList(@RequestParam(name = "name") String name){
        tlr.save(new TemplatesList(name));
        return getAllTemplatesList();
    }

    @PutMapping
    public void updateTemplatesList(@RequestBody TemplatesList templatesList){
        tls.updateTemplateList(templatesList);
    }

    @GetMapping("getEnabledTemplate")
    public TemplatesList getEnabledTemplate(){
        return tls.getEnabledTemplate();
    }

    //          TEMPLATES LIST.end
}

package com.robo.controller;

import com.robo.DTOModel.TemplatesDTO;
import com.robo.DTOModel.TemplatesListDTO;
import com.robo.Entities.Spends;
import com.robo.Entities.TemplatesList;
import com.robo.Entities.User;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.TemplatesListRepo;
import com.robo.service.MonthlySpendsService;
import com.robo.service.SpendsService;
import com.robo.service.TemplatesListService;
import com.robo.service.TemplatesService;
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

    @Autowired
    TemplatesService ts;

    @Autowired
    MonthlySpendsService mss;

    @Autowired
    SpendsService ss;

    private ThreadLocal<User> userSession = new ThreadLocal<>();

    @GetMapping
    public List<TemplatesListDTO> getAllTemplatesList(){ //получить все листы из templates_list
        return tls.getAllTemplatesList();
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

    @DeleteMapping("delete={id}")
    public List<TemplatesListDTO> deleteTemplatesList(@PathVariable Integer id){
        tls.deleteTemplatesList(id);
        return getAllTemplatesList();
    }

    @DeleteMapping("deleteTemplateFromTemplateList")
    public List<TemplatesDTO> deleteTemplateFromTemplateList(@RequestParam(name = "templatesListId") Integer templatesListId,
                                                             @RequestParam(name = "templateId") Integer templateId){
        tls.deleteTemplateFromTemplateList(templatesListId, templateId);
        return ts.getTemplatesDTOByTemplatesListId(templatesListId);
    }

    @PutMapping("create")
    public List<TemplatesListDTO> createTemplatesList(@RequestParam(name = "name") String name){
        return tls.addTemplate(name);
    }

    @PutMapping("createTemplatesListFromMonth")
    public void createTemplatesListFromMonth(
            @RequestParam(name = "dateId") Integer dateId,
            @RequestParam(name = "name") String name){
        tls.createTemplatesListFromMonth(dateId, name);
    }

    @PostMapping("createTemplatesListFromAnotherTemplatesList")
    public List<TemplatesListDTO> createTemplatesListFromTemplatesList(@RequestParam(name = "templatesListId") Integer templatesListId){
        tls.createTemplatesListFromTemplatesList(templatesListId);
        return getAllTemplatesList();
    }

    @PutMapping("/editTemplateInList")
    public List<TemplatesDTO> editTemplateInList(@RequestParam(name = "templatesListId") Integer templatesListId,
                                                 @RequestParam(name = "templateId") Integer templateId,
                                                 @RequestParam(name = "amount") Integer amount,
                                                 @RequestParam(name = "isSalary") Boolean isSalary,
                                                 @RequestParam(name = "isCash") Boolean isCash){
        return tls.editTemplateInList(templatesListId, templateId, amount, isSalary, isCash);
    }

    @PutMapping("/pushSpendToTemplateList")
    public void pushTemplateToTemplateList(
            @RequestParam(name = "templatesListId") Integer templatesListId,
            @RequestParam(name = "spendId") Integer spendId){
        tls.pushSpendToTemplateList(templatesListId, spendId);
    }

//    @PutMapping
//    public void updateTemplatesList(@RequestBody TemplatesList templatesList){
//        tls.updateTemplateList(templatesList);
//    }

    @GetMapping("getEnabledTemplate")
    public TemplatesList getEnabledTemplate(){
        return tls.getEnabledTemplate();
    }


    @GetMapping("/getMissingSpends")
    public List<Spends> getMissingSpends(@RequestParam(name = "templatesListId") Integer templatesListId){ //получить один лист из templates_list по id
        return ss.getMissingSpends(templatesListId);
    }

    @PostMapping("/renameList")
    public List<TemplatesListDTO> renameTemplatesList(@RequestParam(name = "templatesListId") Integer templatesListId, @RequestParam(name = "newName") String newName) {
        tls.renameTemplatesList(templatesListId, newName);
        return getAllTemplatesList();
    }

}

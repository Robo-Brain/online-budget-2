package com.robo.controller;

import com.robo.DTOModel.TemplatesDTO;
import com.robo.repository.TemplatesRepo;
import com.robo.service.SpendsService;
import com.robo.service.TemplatesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/templates")
public class TemplatesController {

    @Autowired
    TemplatesService ts;

    @Autowired
    TemplatesRepo tr;

    @Autowired
    SpendsService ss;

    @GetMapping("{templatesListId}")
    public List<TemplatesDTO> getTemplatesByTemplatesListId(@PathVariable Integer templatesListId){ //получить один лист из templates_list по id
        return ts.getTemplatesDTOByTemplatesListId(templatesListId);
    }

    @PutMapping("/pushSpendToTemplate")
    public void pushSpendToTemplate(@RequestParam(name = "spendId") Integer spendId,
                                   @RequestParam(name = "amount") Integer amount,
                                   @RequestParam(name = "isSalary") Boolean isSalary,
                                   @RequestParam(name = "isCash") Boolean isCash){
        ts.pushSpendToTemplate(spendId, amount, isSalary, isCash);
    }

    @PutMapping("/editTemplate")
    public void editTemplate(@RequestParam(name = "templateId") Integer templateId,
                             @RequestParam(name = "amount") Integer amount,
                             @RequestParam(name = "isSalary") Boolean isSalary,
                             @RequestParam(name = "isCash") Boolean isCash) {
        ts.editTemplate(templateId, amount, isSalary, isCash);
    }

    @DeleteMapping("/deleteSpendFromTemplate")
    public List<TemplatesDTO> deleteSpendFromTemplate(@RequestParam(name = "templateId") Integer templateId,
                                                      @RequestParam(name = "templatesListId") Integer templatesListId,
                                                      @RequestParam(name = "dateId") Integer dateId){
        ts.deleteTemplate(templateId, dateId);
        return getTemplatesByTemplatesListId(templatesListId);
    }

}

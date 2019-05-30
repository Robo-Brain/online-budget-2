package com.robo.controller;

import com.robo.DTOModel.TemplatesDTO;
import com.robo.Entities.Spends;
import com.robo.repository.TemplatesRepo;
import com.robo.service.SpendsService;
import com.robo.service.TemplatesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/templates")
public class TemplatesController {

    @Autowired
    TemplatesService ts;

    @Autowired
    TemplatesRepo tr;

    @Autowired
    SpendsService ss;

    @GetMapping("{id}")
    public List<TemplatesDTO> getTemplatesByTemplatesListId(@PathVariable Integer id){ //получить один лист из templates_list по id
        return ts.getTemplatesDTOByTemplatesListId(id);
    }

//    @PutMapping("/pushSpendToTemplate")
//    public List<Spends> pushSpendToTemplate(@RequestBody Map<String, String> requestParams){
//        ts.pushSpendToTemplate(requestParams);
//        Integer templateId = Integer.valueOf(requestParams.get("templateId"));
//        return ss.getMissingSpends(templateId);
//    }

    @GetMapping("/getMissingSpends")
    public List<Spends> getMissingSpends(@RequestParam(name = "templatesListId") String templatesListId){ //получить один лист из templates_list по id
        return ss.getMissingSpends(Integer.valueOf(templatesListId));
    }

    @PutMapping("/addSpendToTemplate")
    public List<Spends> addSpendToTemplate(@RequestParam Map<String,String> requestParams){
        ts.pushSpendToTemplateAndTemplatesList(requestParams);
        return getMissingSpends(requestParams.get("templatesListId"));
    }

    @PutMapping("/editTemplate")
    public void editTemplate(@RequestParam Map<String,String> requestParams) { ts.editSpendInTemplate(requestParams); }

    @PutMapping("/editTemplateInMonth")
    public void editTemplateInMonth(@RequestParam Map<String,String> requestParams) { ts.editSpendInTemplate(requestParams); }

    @DeleteMapping("/deleteTemplateFromTemplateList")
    public List<TemplatesDTO> deleteTemplateFromTemplateList(@RequestParam(name = "templatesListId") String templatesListId, @RequestParam(name = "templateId") String templateId){
        ts.deleteTemplateFromTemplateList(templatesListId, templateId);
        return getTemplatesByTemplatesListId(Integer.valueOf(templatesListId));
    }

    @DeleteMapping("/deleteSpendFromTemplate")
    public List<TemplatesDTO> deleteSpendFromTemplate(@RequestParam(name = "templateId") String templateId, @RequestParam(name = "templatesListId") String templatesListId, @RequestParam(name = "dateId") String dateId){
        ts.deleteSpendFromTemplate(templateId, dateId);
        return getTemplatesByTemplatesListId(Integer.valueOf(templatesListId));
    }

}

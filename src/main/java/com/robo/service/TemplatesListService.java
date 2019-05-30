package com.robo.service;

import com.robo.DTOModel.TemplatesDTO;
import com.robo.DTOModel.TemplatesListDTO;
import com.robo.Entities.TemplatesList;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.TemplatesListRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TemplatesListService {

    @Autowired
    TemplatesListRepo tlr;

    @Autowired
    TemplatesService ts;

    public void addTemplate(String name) {
        tlr.save(new TemplatesList(name));
    }

    public List<TemplatesListDTO> getTemplatesList(){
        List<TemplatesList> templatesLists = tlr.findAll();
        List<TemplatesListDTO> spendsTemplatesDTOList = new ArrayList<>();

        templatesLists.forEach(template -> {
            TemplatesListDTO tlDTO = new TemplatesListDTO();
            tlDTO.setId(template.getId()); // templates.id
            tlDTO.setTemplateName(template.getName()); // templates.name
            tlDTO.setTemplateEnabled(template.isEnabled()); // templates.enabled

            spendsTemplatesDTOList.add(tlDTO);
        });

        return spendsTemplatesDTOList;
    }

    public List<TemplatesListDTO> getExtendedTemplatesList(){
        List<TemplatesList> templatesLists = tlr.findAll();
        List<TemplatesListDTO> spendsTemplatesDTOList = new ArrayList<>();

        templatesLists.forEach(template -> {
            TemplatesListDTO tlDTO = new TemplatesListDTO();
            List<TemplatesDTO> tDTOList = ts.getTemplatesDTOByTemplatesListId(template.getId());

            tlDTO.setId(template.getId()); // templates.id
            tlDTO.setTemplateName(template.getName()); // templates.name
            tlDTO.setTemplateEnabled(template.isEnabled()); // templates.enabled
            tlDTO.setTemplatesDTOList(tDTOList);

            spendsTemplatesDTOList.add(tlDTO);
        });

        return spendsTemplatesDTOList;
    }

    public void updateTemplateList(TemplatesList tl){
        TemplatesList templatesList = tlr.findOneById(tl.getId()).orElseThrow(RuntimeException::new);

        templatesList.setName(tl.getName());
        templatesList.setTemplateId(tl.getTemplateId());

        tlr.save(templatesList);
    }

//    public void deleteTemplatesList(Integer id) {
//        TemplatesList templatesList = tlr.findOneById(id).orElseThrow(RuntimeException::new);
//        tlr.delete(templatesList);
//    }

    public void addTemplateIdIntoTemplateList(Map<String, String> id) {
        Integer templatesListId = Integer.valueOf(id.get("templateListId"));
        String templateId = id.get("templateId");
        String ids;

        TemplatesList templatesList = tlr.findOneById(templatesListId).orElseThrow(RuntimeException::new);
        if (templatesList.getTemplateId() == null){
            ids = templateId;
        } else {
            ids = templatesList.getTemplateId() + "," + templateId;
        }
//        String ids2 = Optional.ofNullable(templatesList.getTemplateId()).orElse(templateId);
//        ids += templateId;
        templatesList.setTemplateId(ids);

        tlr.save(templatesList);
    }

    public void makeTemplateWithIdActive(Integer id) {
        Optional.ofNullable(id).orElseThrow(RuntimeException::new);
        List<TemplatesList> allTemplatesList = tlr.findAll();
        allTemplatesList.forEach(templateList -> {
            if (templateList.getId().equals(id)) {
                templateList.setEnabled(true);
            } else {
                templateList.setEnabled(false);
            }
            tlr.save(templateList);
        });
    }

    public TemplatesList getEnabledTemplate() {
        return tlr.findEnabled().orElseThrow(NotFoundException::new);
    }

}

package com.robo.service;

import com.robo.DTOModel.TemplatesDTO;
import com.robo.DTOModel.TemplatesListDTO;
import com.robo.Entities.MonthlySpends;
import com.robo.Entities.Templates;
import com.robo.Entities.TemplatesList;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.MonthlySpendsRepo;
import com.robo.repository.TemplatesListRepo;
import com.robo.repository.TemplatesRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TemplatesListService {

    @Autowired
    TemplatesListRepo tlr;

    @Autowired
    TemplatesRepo tr;

    @Autowired
    TemplatesService ts;

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    MonthlySpendsService mss;

    public List<TemplatesListDTO> addTemplate(String name) {
        if (!tlr.findByName(name).isPresent()){
            tlr.save(new TemplatesList(name));
        }
        return getAllTemplatesList();
    }

    public List<TemplatesListDTO> getAllTemplatesList(){
        List<TemplatesList> templatesLists = tlr.findAll();
        List<TemplatesListDTO> spendsTemplatesDTOList = new ArrayList<>();

        templatesLists.forEach(tl -> {
            TemplatesListDTO tlDTO = new TemplatesListDTO();
            tlDTO.setId(tl.getId()); // templates.id
            tlDTO.setTemplateName(tl.getName()); // templates.name

            if (templatesLists.size() == 1) { // если шаблон всего 1
                tl.setEnabled(true); //сделать его активным
                tlr.save(tl);
                tlDTO.setTemplateEnabled(true); // принудительно
            } else tlDTO.setTemplateEnabled(tl.isEnabled()); // иначе спользовать значение из БД

            spendsTemplatesDTOList.add(tlDTO);
        });

        return spendsTemplatesDTOList;
    }

    public void pushSpendToTemplateList(Integer templatesListId, Integer spendId) {
        TemplatesList templatesList = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);
        Templates template = ts.pushSpendToTemplate(spendId, 0, true, true);
        if (Objects.nonNull(templatesList.getTemplateId()) && templatesList.getTemplateId().length() > 0 ){ // проверяем длину "списка" айдишников templates (template_id)
            templatesList.setTemplateId(templatesList.getTemplateId() + "," + template.getId()); // значит там есть айдишники, нужно взять их и добавить к ним запятую + новый айди
        } else {
            templatesList.setTemplateId(String.valueOf(template.getId())); // если нет айдишников, то не надо ставить запятую
        }
        tlr.save(templatesList);
    }

    public void deleteTemplateFromTemplateList(Integer templatesListId, Integer templateId) {// удаляет template из одного конкретного листа, сам template НЕ удаляется!
        TemplatesList templatesList = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);
        Templates tmp = tr.findOneById(templateId).orElseThrow(NotFoundException::new);
        if (Objects.nonNull(templatesList.getTemplateId()) && templatesList.getTemplateId().length() > 0){
            String[] ids = templatesList.getTemplateId().split(",");
            String result = Arrays.stream(ids).filter(i -> !i.equals(String.valueOf(templateId))).collect(Collectors.joining(",","",""));
            templatesList.setTemplateId(result);
            tlr.save(templatesList);

            Boolean templatesListsHaveThisTemplateId = false;
            List<TemplatesList> templatesLists = tlr.findAll();
            for (TemplatesList tl : templatesLists) {
                if (!templatesListsHaveThisTemplateId) {
                    String[] id = tl.getTemplateId().split(","); // для каждого templates_list'a получить список template_id
                    templatesListsHaveThisTemplateId = Arrays.asList(id).contains(String.valueOf(templateId)); // если найден templates_list с таким template_id, то прервать цикл и не удалять template_id
                }
            }
            if (!templatesListsHaveThisTemplateId){ // если в шаблонах не найдено template с таким id
                List<MonthlySpends> monthlySpendsList = msr.findAllByTemplateId(templateId);
                if (monthlySpendsList.isEmpty()){ // если нет template с таким id в monthly_spends, то этот template можно удалять
                    tr.delete(tmp);
                }
            }
        }
    }

    void searchAndDeleteTemplateFromTemplatesList(Integer templateId) { // удаляет template из templates_list
        List<TemplatesList> templatesLists = tlr.findAll();
        templatesLists.forEach(templatesList -> {
            if (Objects.nonNull(templatesList.getTemplateId()) && templatesList.getTemplateId().length() > 0){
                String[] ids = templatesList.getTemplateId().split(",");
                if (Arrays.asList(ids).contains(String.valueOf(templateId))) {
                    String result = Arrays.stream(ids).filter(i -> !i.equals(String.valueOf(templateId))).collect(Collectors.joining(",","",""));
                    templatesList.setTemplateId(result);
                    tlr.save(templatesList);
                }
            }
        });
    }

    public List<TemplatesDTO> editTemplateInList(Integer templatesListId, Integer templateId, Integer amount, Boolean isSalary, Boolean isCash){
        TemplatesList templatesList = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);
        Templates template = ts.editTemplate(templateId, amount, isSalary, isCash);
        List<String> ids = Arrays.asList(templatesList.getTemplateId().split(","));
        Collections.replaceAll(ids, String.valueOf(templateId), String.valueOf(template.getId()));
        templatesList.setTemplateId(ids.stream().collect(Collectors.joining(",","","")));
        tlr.save(templatesList);
        return ts.getTemplatesDTOByTemplatesListId(templatesListId);
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

    public void deleteTemplatesList(Integer id){
        TemplatesList tl = tlr.findOneById(id).orElseThrow(NotFoundException::new);
        tlr.delete(tl);
    }

    public TemplatesList getEnabledTemplate() {
        return tlr.findEnabled().orElseThrow(NotFoundException::new);
    }


    public void createTemplatesListFromMonth(Integer dateId, String name){
        if (!tlr.findByName(name).isPresent()){
            String templateIds = mss.getMonthlySpendsByDateId(dateId).stream().map(ms -> String.valueOf(ms.getTemplateId())).collect(Collectors.joining(",","",""));
            if (templateIds.length() > 0) {
                TemplatesList tl = new TemplatesList();
                tl.setName(name);
                tl.setTemplateId(templateIds);
                tlr.save(tl);
            } else throw new NotFoundException();
        } else throw new RuntimeException("Found Template List with same name.");
    }

    public void renameTemplatesList(Integer templatesListId, String newName){
        TemplatesList tl = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);
        tl.setName(newName);
        tlr.save(tl);
    }

}

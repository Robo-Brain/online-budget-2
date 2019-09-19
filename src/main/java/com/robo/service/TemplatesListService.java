package com.robo.service;

import com.robo.DTOModel.TemplatesDTO;
import com.robo.DTOModel.TemplatesListDTO;
import com.robo.Entities.Dates;
import com.robo.Entities.Templates;
import com.robo.Entities.TemplatesList;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.DatesRepo;
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

    @Autowired
    DatesRepo dr;

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

        if (Objects.nonNull(template.getId())
                && template.getId() > 0){
            if (Objects.nonNull(templatesList.getTemplateId()) && templatesList.getTemplateId().length() > 0){
                templatesList.setTemplateId(templatesList.getTemplateId() + "," + template.getId()); // значит там есть айдишники, нужно взять их и добавить к ним запятую + новый айди
            } else {
                templatesList.setTemplateId(String.valueOf(template.getId())); // если нет айдишников, то не надо ставить запятую.
            }
            tlr.save(templatesList);
        }
    }

    private TemplatesList replaceTemplateInTemplatesList(TemplatesList tl, Integer oldTemplateId, Integer newTemplateId) {
        List<String> ids = Arrays.asList(tl.getTemplateId().split(","));
        Collections.replaceAll(ids, String.valueOf(oldTemplateId), String.valueOf(newTemplateId));
        tl.setTemplateId(ids.stream().collect(Collectors.joining(",","","")));
        tlr.save(tl);
        tl = deleteTemplateFromTemplateList(tl.getId(), oldTemplateId);
        return tl;
    }

    public TemplatesList deleteTemplateFromTemplateList(Integer templatesListId, Integer templateId) {// удаляет template из одного листа, также ищет в других и в monthly_spends, если не находит
        TemplatesList templatesList = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);// то удаляет template
        if (Objects.nonNull(templatesList.getTemplateId()) && templatesList.getTemplateId().length() > 0){ // удалить template из одного конкретного листа
            String[] ids = templatesList.getTemplateId().split(",");
            String result = Arrays.stream(ids).filter(i -> !i.equals(String.valueOf(templateId))).collect(Collectors.joining(",","",""));
            templatesList.setTemplateId(result);
            tlr.save(templatesList);
            ts.deleteTemplate(templateId); // проверить используется ли где-то этот template, если нет - удалить
        }
        return templatesList;
    }

    void searchAndDeleteTemplateFromTemplatesList(Integer templateId) { // удаляет template из всех templates_list принудительно, поскольку удаляется template
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
        Templates template = tr.findOneById(templateId).orElseThrow(NotFoundException::new);
        template = ts.editTemplate(template.getId(), amount, isSalary, isCash);
        templatesList = replaceTemplateInTemplatesList(templatesList, templateId, template.getId());
        //найти и удалить старый templateId
        return ts.getTemplatesDTOByTemplatesListId(templatesList.getId());
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
        Integer templatesListId = tl.getId();
        tlr.delete(tl);

        List<Dates> datesList = dr.findAllByTemplateListId(templatesListId);
        datesList.forEach(date -> {
            date.setTemplateListId(null);
            dr.save(date);
        });

        Arrays.asList(tl.getTemplateId().split(",")).forEach(templateId -> ts.deleteTemplate(Integer.valueOf(templateId))); // удалить template, если его нет в месяцах
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

    Boolean templatesListContainsTemplateWithId(Integer templateId) {
        return tlr.findAll()
                .stream()
                .map(tl ->
                        Arrays.asList(tl.getTemplateId().split(",")))
                            .anyMatch(ids ->
                                    ids.contains(String.valueOf(templateId)));
    }

}

package com.robo.service;

import com.robo.DTOModel.TemplatesDTO;
import com.robo.Entities.MonthlySpends;
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
public class TemplatesService {

    @Autowired
    TemplatesRepo tr;

    @Autowired
    TemplatesListRepo tlr;

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    DatesRepo dr;

    public List<TemplatesDTO> getTemplatesDTOByTemplatesListId(Integer id) {
        TemplatesList templatesList = tlr.findOneById(id).orElseThrow(RuntimeException::new);
        List<TemplatesDTO> resultListDTO = new ArrayList<>();

        if (Objects.nonNull(templatesList.getTemplateId()) && !templatesList.getTemplateId().equals("")){
            String[] tmpIds = templatesList.getTemplateId().split(",");
            Arrays.stream(tmpIds).forEach(tmpId -> resultListDTO.add(getTemplateDTOByTemplateId(Integer.valueOf(tmpId))));
        } else { // если нет templates в листе - создать пустой TemplatesDTO
            resultListDTO.add(new TemplatesDTO());
        }

        return resultListDTO;
    }

    private TemplatesDTO getTemplateDTOByTemplateId(Integer templateId) {
        TemplatesDTO tDTO = new TemplatesDTO();
        Templates template = tr.findOneById(templateId).orElseThrow(RuntimeException::new);

        tDTO.setTemplateId(template.getId());
        tDTO.setSpendId(template.getSpendId());
        tDTO.setSpendName(template.getSpends().getName());
        tDTO.setAmount(template.getAmount());
        tDTO.setSalaryOrPrepaid(template.isSalaryOrPrepaid());
        tDTO.setCashOrCard(template.isCashOrCard());

        return tDTO;
    }

    public void pushSpendToTemplateAndTemplatesList(Map<String, String> tmpMap) { // запушить новый(?) spend в template, а также в templatesList по возможности
        String templatesListId = tmpMap.get("templatesListId");
        String spendId = tmpMap.get("spendId");
        Integer amount = Objects.isNull(tmpMap.get("amount")) ? 0 : Integer.valueOf(tmpMap.get("amount"));
        boolean salaryOrPrepaid = !Objects.isNull(tmpMap.get("salaryOrPrepaid")) && Boolean.parseBoolean(tmpMap.get("salaryOrPrepaid"));
        boolean cashOrCard = !Objects.isNull(tmpMap.get("isCash")) && Boolean.parseBoolean(tmpMap.get("isCash"));

        Templates template = pushSpendToTemplate(spendId, amount, salaryOrPrepaid, cashOrCard);
        if (Objects.nonNull(templatesListId)){
            TemplatesList templatesList = tlr.findOneById(Integer.valueOf(templatesListId)).orElseThrow(NotFoundException::new);
            if (Objects.nonNull(templatesList.getTemplateId()) && templatesList.getTemplateId().length() >= 1 ){
                templatesList.setTemplateId(templatesList.getTemplateId() + "," + template.getId()); // если уже есть айдишники, то взять их и приплюсовать к ним запятую и новый айди
            } else {
                templatesList.setTemplateId(String.valueOf(template.getId())); // если нет айдишников, то не надо ставить запятую
            }
            tlr.save(templatesList);
        }
    }

    Templates pushSpendToTemplate(String spendId, Integer amount, Boolean isSalary, Boolean isCash) {
        Optional<List<Templates>> template = tr.findBySpendId(Integer.valueOf(spendId));
        Templates newTemplate = new Templates();
        newTemplate.setSpendId(Integer.valueOf(spendId));
        newTemplate.setAmount(amount);
        newTemplate.setSalaryOrPrepaid(isSalary);
        newTemplate.setCashOrCard(isCash);

        if (template.isPresent()){
            List<Templates> templateList = template.get();
            List<Templates> resultList = templateList.stream().filter(t -> t.equals(newTemplate)).collect(Collectors.toList());
            if (resultList.size() == 0){
                tr.save(newTemplate);
                return newTemplate;
            } else if (resultList.size() == 1){
                return resultList.get(0);
            } else throw new RuntimeException("В таблице templates обнаружены повтряющиеся значения, такого быть не должно, необходимо запустить процедуру проверки.");
        } else { // если такого spend вообще нет в templates
            tr.save(newTemplate); // значит добавляем неглядя
            return newTemplate;
        }
    }

    public void editSpendInTemplate(Map<String, String> tmpMap) { //вообще этот метод не меняет Template, он создает новый, а старый остается в БД, на случай, если он был использован в прошлых шаблонах
        String templatesListId = tmpMap.get("templatesListId");
        String templateId = tmpMap.get("templateId");

        if (Objects.nonNull(templatesListId)){
            deleteTemplateFromTemplateList(templatesListId, templateId);
        }
        pushSpendToTemplateAndTemplatesList(tmpMap);
    }

    public void deleteTemplateFromTemplateList(String templatesListId, String templateId) {// удаляет template из одного конкретного листа, сам template НЕ удаляется!
        TemplatesList templatesList = tlr.findOneById(Integer.valueOf(templatesListId)).orElseThrow(NotFoundException::new);
        String[] ids = templatesListId.length() > 3 || templatesListId.contains(",") ? templatesListId.split(",") : templatesList.getTemplateId().split(",");
        String result = Arrays.stream(ids).filter(i -> !i.equals(templateId)).collect(Collectors.joining(",","",""));
        templatesList.setTemplateId(result);

        tlr.save(templatesList);
    }

    public void deleteSpendFromTemplate(String templateId, String dateId) { //удалить САМ template отовсюду при условии, что его нет в monthly_spends
        List<MonthlySpends> allMonthlySpends = msr.findAllByTemplateId(Integer.valueOf(templateId));
        if (allMonthlySpends.size() == 0 & Objects.isNull(dateId)){ // если dateId не передается & в monthly_spends пусто, значит template удаляется только из таблицы templates, он еще не успел попасть в monthly_spends
            List<TemplatesList> templatesList = tlr.findAll();
            templatesList.forEach(list -> deleteTemplateFromTemplateList(String.valueOf(list.getId()), templateId));
            Templates template = tr.findOneById(Integer.valueOf(templateId)).orElseThrow(NotFoundException::new);
            tr.delete(template);
        } else if (allMonthlySpends.size() == 1 & Objects.nonNull(dateId)) { // передается dateId, также template с таким ID найден в ОДНОМ месяце, а значит template удаляется из одного месяца и таблицы Templates
            if (allMonthlySpends.get(0).getDateId().equals(Integer.valueOf(dateId))){ // если ЕДИНСТВЕННЫЙ месяц, из которого удаляется template имеет date_id == переданному с морды dateId, значит все в порядке, template удаляется только из этого конкретно месяца

                Optional<List<MonthlySpends>> msList = msr.findAllByDateIdAndTemplateId(Integer.valueOf(dateId), Integer.valueOf(templateId));

                msList.ifPresent(monthlySpends -> monthlySpends
                        .forEach(ms -> msr.delete(ms)));

                dr.findOneById(Integer.valueOf(dateId))
                        .ifPresent(listId ->
                                deleteTemplateFromTemplateList(String.valueOf(listId.getTemplateListId()), templateId)); // если с dateId все ОК, найти какой templatesList к нему "прикреплен" и удалить из него template

                tr.findOneById(Integer.valueOf(templateId))
                        .ifPresent(t -> tr.delete(t));
            } else System.out.println("date_id != переданному с фронта dateId, нас хекают!");
        } else if(allMonthlySpends.size() == 0 & Objects.nonNull(dateId)) {
            System.out.println("dateId приходит с фронта, но в monthly_spends нет полей с таким templateId, что и откуда удаляем?");
        }
    }

}

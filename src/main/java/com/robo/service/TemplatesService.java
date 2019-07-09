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

@Service
public class TemplatesService {

    @Autowired
    TemplatesRepo tr;

    @Autowired
    TemplatesListRepo tlr;

    @Autowired
    TemplatesListService tls;

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    DatesRepo dr;

    public List<TemplatesDTO> getTemplatesDTOByTemplatesListId(Integer templatesListId) {
        TemplatesList templatesList = tlr.findOneById(templatesListId).orElseThrow(RuntimeException::new);
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
        tDTO.setSalary(template.isSalary());
        tDTO.setCash(template.isCash());

        return tDTO;
    }

    public Templates pushSpendToTemplate(Integer spendId, Integer amount, Boolean isSalary, Boolean isCash) { // решить что-то с пушем в темплейтЛист
        Templates newTemplate = new Templates();
        newTemplate.setSpendId(spendId);
        newTemplate.setAmount(Objects.nonNull(amount) && amount > 99 ? amount : 0);
        newTemplate.setSalary(Objects.nonNull(isSalary) ? isSalary : true);
        newTemplate.setCash(Objects.nonNull(isCash) ? isCash : true);
        newTemplate = findSameTemplates(newTemplate); // вернуть найденный template с такими параметрами, либо вернуть ЭТОТ ЖЕ обратно
        if (newTemplate.getAmount().equals(0)){
            newTemplate.setAmount(amount);
        }
        tr.save(newTemplate);
        return newTemplate;
    }

    public Templates editTemplate(Integer templateId, Integer amount, Boolean isSalary, Boolean isCash) {
        Templates template = tr.findOneById(templateId).orElseThrow(NotFoundException::new);
        if (!msr.findAllByTemplateId(template.getId()).isEmpty()){ // если шаблон найден в месяцах(использовался когда-либо), то не удалять его, а создать новый
            return pushSpendToTemplate(template.getSpendId(), amount, isSalary, isCash); // метод создаст новый templates и, если нужно, поместит его в templatesList
        } else { // если template не использовался до сих пор, то изменить его и сохранить (новый не создавать)
            template.setAmount(amount);
            template.setSalary(isSalary);
            template.setCash(isCash);
            tr.save(template);
            return template;
        }
    }

    public void deleteTemplate(Integer templateId, Integer dateId) { //удалить template отовсюду при условии, что его нет в monthly_spends
        Templates template = tr.findOneById(templateId).orElseThrow(NotFoundException::new);
        List<MonthlySpends> allMonthlySpends = msr.findAllByTemplateId(templateId);
        if (allMonthlySpends.isEmpty()){ // если в monthly_spends пусто, значит template нет в monthly_spends и можно его смело удалять
            tls.searchAndDeleteTemplateFromTemplatesList(templateId);
            tr.delete(template); // раз нет в monthly_spends, то можно его мочить
        } else if (allMonthlySpends.size() == 1
                && Objects.nonNull(dateId)
                && dateId > 0
                ){ // передается dateId, также template с таким ID найден в ОДНОМ месяце, а значит template удаляется из одного месяца и таблицы Templates
            if (allMonthlySpends.get(0).getDateId().equals(dateId)){ // если ЕДИНСТВЕННЫЙ месяц, из которого удаляется template имеет date_id == переданному с морды dateId, значит все в порядке, template удаляется только из этого конкретно месяца
                Optional<List<MonthlySpends>> msList = msr.findAllByDateIdAndTemplateId(dateId, templateId);

                msList.ifPresent(monthlySpends -> monthlySpends
                        .forEach(ms -> msr.delete(ms)));

                dr.findOneById(dateId)
                        .ifPresent(listId ->
                                tls.deleteTemplateFromTemplateList(listId.getTemplateListId(), templateId)); // если с dateId все ОК, найти какой templatesList к нему "прикреплен" и удалить из него template

                tr.delete(template);
            } else System.out.println("date_id != переданному с фронта dateId, на нас напали!");
        }
    }

    void deleteTemplate(Integer templateId) { //удалить template отовсюду при условии, что его нет в monthly_spends
        Templates template = tr.findOneById(templateId).orElseThrow(NotFoundException::new);
        List<MonthlySpends> allMonthlySpends = msr.findAllByTemplateId(templateId);
        if (allMonthlySpends.isEmpty()){ // если в monthly_spends пусто, значит template нет в monthly_spends и можно его смело удалять
            tls.searchAndDeleteTemplateFromTemplatesList(templateId);
            tr.delete(template); // раз нет в monthly_spends, то можно его мочить
        }
    }

    private Templates findSameTemplates(Templates template){
        Optional<List<Templates>> templateList = tr.findSameTemplate(template.getSpendId(), template.getAmount(), template.isSalary(), template.isCash());
        if (templateList.isPresent()){
//            List<Templates> templates = templateList.get();
//            List<Templates> resultList = templates.stream().filter( // проверить если уже есть template - положить его в список
//                    t ->    t.getSpendId().equals(template.getSpendId())
//                            && t.isSalary() == template.isSalary()
//                            && t.isCash() == template.isCash()
//                            && (
//                            t.getAmount().equals(template.getAmount())
//                                    || t.getAmount().equals(0)
//                    ) // или если есть точно такой же template с нулевой суммой
//                ).collect(Collectors.toList());
//
//            if (resultList.size() == 0) { // если количество найденных templates с точно такими же параметрами == 0, то вернуть новый template
//                return template;
//            }
            if (templateList.get().size() == 1) { // если найден точно такой же template, то вернуть его
                return templateList.get().get(0);
            } else throw new RuntimeException("В таблице templates обнаружены повтряющиеся значения, такого быть не должно, необходимо инициировать экстерминатус.");

        } else { // если такого spend вообще нет в templates то вернуть обратно template для сохранения нового
            return template;
        }
    }

}

package com.robo.service;

import com.robo.Entities.MonthlySpends;
import com.robo.Entities.Spends;
import com.robo.Entities.Templates;
import com.robo.Entities.TemplatesList;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.MonthlySpendsRepo;
import com.robo.repository.SpendsRepo;
import com.robo.repository.TemplatesListRepo;
import com.robo.repository.TemplatesRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SpendsService {

    @Autowired
    SpendsRepo sr;

    @Autowired
    TemplatesListRepo tlr;

    @Autowired
    TemplatesRepo tr;

    @Autowired
    MonthlySpendsRepo msr;

    public List<Spends> getMissingSpends(Integer templatesListId) {
        TemplatesList templatesList = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);
        String templatesId = Optional.ofNullable(templatesList.getTemplateId()).orElse("");
        return getDifferentialSpendsList(templatesId);
    }

    public List<Spends> getMonthlyMissingSpends(Integer monthlyDateId) {
        List<MonthlySpends> msList = msr.findAllByDateId(monthlyDateId).orElseThrow(NotFoundException::new); //найти все monthly_spends с одинаковым date_id
        String templatesIdEnum = msList.stream().map((item) -> item.getTemplateId().toString()).collect(Collectors.joining(",","","")); // строка представляющая из себя перечисление template_id через запятую
        return getDifferentialSpendsList(templatesIdEnum);
    }

//    public List<Spends> getMonthlyMissingSpends(Integer monthlySpendsId) {
//        MonthlySpends ms = msr.findOneById(monthlySpendsId).orElseThrow(NotFoundException::new);
//        List<MonthlySpends> msList = msr.findAllByDateId(ms.getDateId()).orElseThrow(NotFoundException::new); //найти все monthly_spends с одинаковым date_id
//        String templatesIdEnum = msList.stream().map((item) -> item.getTemplateId().toString()).collect(Collectors.joining(",","","")); // строка представляющая из себя перечисление template_id через запятую
//        return getDifferentialSpendsList(templatesIdEnum);
//    }

    private List<Spends> getDifferentialSpendsList(String templatesIdEnum){ //метод возвращает разницу между spend_id которые существует ВООБЩЕ и межуд теми, что указаны в templatesList, строка на входе представляет из себя перечисление template_id через запятую
        List<Spends> spends = sr.findAll(); // переписать метод, сравнивать листы с ID, а не с сущностями, возвращать сущности по оставшимся id
        if (templatesIdEnum.length() > 0) {
            List<Spends> templatesSpends = new ArrayList<>();
            String[] tmpIds = templatesIdEnum.split(",");
            Arrays.asList(tmpIds).forEach(tmpId -> { // для каждого template_id ищем Template, если все ок и template найден, то
                Templates t = tr.findOneById(Integer.valueOf(tmpId)).orElseThrow(NotFoundException::new);
                templatesSpends.add(sr.findOneById(t.getSpendId())); // берем spend_id из template и пихаем в лист
            });
            spends.removeAll(templatesSpends); // "сравниваем" листы полученные из таблицы spends и из templates_lists
        }
        return spends;
    }

    public void editSpend(Map<String, String> params){
        Integer id = Integer.valueOf(params.get("id"));
        String name = params.get("name");
        Spends spend = sr.findOneById(id);
        spend.setName(name);
        sr.save(spend);
    }

}

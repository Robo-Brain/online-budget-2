package com.robo.service;

import com.robo.DTOModel.MonthlySpendsDTO;
import com.robo.DTOModel.TemplatesDTO;
import com.robo.Entities.Dates;
import com.robo.Entities.MonthlySpends;
import com.robo.Entities.Templates;
import com.robo.Entities.TemplatesList;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.DatesRepo;
import com.robo.repository.MonthlySpendsRepo;
import com.robo.repository.SpendsRepo;
import com.robo.repository.TemplatesListRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class MonthlySpendsService {

    @Autowired
    TemplatesListRepo tlr;

    @Autowired
    TemplatesListService tls;

    @Autowired
    SpendsRepo sr;

    @Autowired
    MonthlySpendsRepo msr;

    @Autowired
    TemplatesService ts;

    @Autowired
    DatesService ds;

    @Autowired
    DatesRepo dr;

    public List<MonthlySpendsDTO> getCurrentMonth() {
        Dates date = ds.getTodaysDate(); // получить сегодняшнюю дату и вернуть для нее entity dates иначе new Dates()
        if (Objects.nonNull(date.getId())){ // проверить, вернулся заполненный Dates или пустой
            return getMonthsDTOByDateID(date.getId()); // вернуть найденную дату, если она найдена
        } else {
            throw new NotFoundException(); // временная заглушка, которая возвращает null, если в dates нет сегодняшнего месяца и на морде выскакивает модальное окно
        }
    }

    public List<MonthlySpendsDTO> getLastMonth() {
        Dates date = ds.getLastDate(); // получить сегодняшнюю дату и вернуть для нее entity dates иначе new Dates().
        if (Objects.nonNull(date.getId())){ // проверить, вернулся заполненный Dates или пустой
            return getMonthsDTOByDateID(date.getId()); // вернуть найденную дату, если она найдена
        } else {
            throw new NotFoundException(); // временная заглушка, которая возвращает null, если в dates нет месяца
        }
    }

    public List<MonthlySpendsDTO> getMonthsDTOByDateID(Integer dateID) {
        List<MonthlySpends> allMonthlySpends = getMonthlySpendsByDateId(dateID);
        if (Objects.nonNull(allMonthlySpends) && allMonthlySpends.size() > 0){
            List<MonthlySpendsDTO> resultList = new ArrayList<>();
            allMonthlySpends.forEach(monthlySpends -> {
                MonthlySpendsDTO msDTO = new MonthlySpendsDTO(monthlySpends);
                resultList.add(msDTO);
            });
            return resultList;
        } else {
            return null;
        }
    }

    public List<List<MonthlySpendsDTO>> getAllMonthlySpends() {
        List<Dates> dates = dr.findAll();
        List<List<MonthlySpendsDTO>> resultList = new ArrayList<>();
        dates.forEach(date -> resultList.add(new ArrayList<>(getMonthsDTOByDateID(date.getId()))));
        return resultList;
    }

    private List<MonthlySpends> getMonthlySpendsByDateId(Integer id){
        List<MonthlySpends> ms = new ArrayList<>();
        return msr.findAllByDateId(id).orElse(ms);
    }

    public void createMonthFromEnabledTemplatesList() {
        createNewMonthByTemplatesList(tls.getEnabledTemplate().getId());
    }

    public void createMonthFromLastMonth() {
        MonthlySpends ms = msr.findTopByOrderByIdDesc();
        Integer templatesListId = ms.getDates().getTemplateListId();
        TemplatesList tl = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);
        createNewMonthByTemplatesList(tl.getId());
    }

    private void createNewMonthByTemplatesList(Integer templatesListId) {
        if (Objects.nonNull(templatesListId) && Objects.isNull(ds.getTodaysDate().getId())){
            Dates d = new Dates();
            d.setDate(LocalDate.now());
            d.setTemplateListId(templatesListId);
            d.setCompleted(false);
            dr.save(d);

            List<TemplatesDTO> templatesDTO = ts.getTemplatesDTOByTemplatesListId(templatesListId);
            templatesDTO.forEach(template -> msr.save(setMonthlySpends(d.getId(), template.getTemplateId(), 0)));
        }
    }

    public List<MonthlySpendsDTO> editMonthSpend(Map<String,String> req) { // изменить template созданный в месяце, без участия шаблона
        String monthlySpendsId = req.get("monthlySpendsId"); // обязательно, нужно знать какое поле меняем
        if (Objects.nonNull(monthlySpendsId)){
            MonthlySpends ms = msr.findOneById(Integer.valueOf(monthlySpendsId)).orElseThrow(NotFoundException::new);
            Integer spendId = ms.getTemplates().getSpendId();
            Integer dateId = ms.getDateId();
            System.out.println("req.get(isSalary): " + req.get("isSalary") + "req.get(isCash): " + req.get("isCash"));
            String amount = Objects.nonNull(req.get("amount")) & req.get("amount").length() > 2 // здесь и далее получать значения из Map || из существующего entity, если в Map их нет
                    ? req.get("amount")
                    : String.valueOf(ms.getTemplates().getAmount());

            Boolean isSalary = Objects.nonNull(req.get("isSalary")) && req.get("isSalary").length() > 0
                    ? Boolean.parseBoolean(req.get("isSalary"))
                    : ms.getTemplates().isSalaryOrPrepaid();

            Boolean isCash = Objects.nonNull(req.get("isCash")) && req.get("isCash").length() > 0
                    ? Boolean.parseBoolean(req.get("isCash"))
                    : ms.getTemplates().isCashOrCard();

            Templates t = ts.pushSpendToTemplate(String.valueOf(spendId), Integer.valueOf(amount), isSalary, isCash);
            System.out.println("\n---\nTemplate: " + t);
            ms.setTemplateId(t.getId());
            System.out.println("MonthlySpend: " + ms);
            msr.save(ms);
            return getMonthsDTOByDateID(dateId);
        } else throw new NotFoundException();
    }

    public List<MonthlySpendsDTO> pushSpendToMonth(Map<String, String> req) {
        String spendId = req.get("spendId"); // должно быть заполнено ТОЛЬКО если это НОВЫЙ spend добавляется непосредственно в monthly_spends

        Integer amount = Objects.isNull(req.get("amount")) ? 0 : Integer.valueOf(req.get("amount"));
        boolean salaryOrPrepaid = !Objects.isNull(req.get("isCash")) && Boolean.parseBoolean(req.get("isCash"));
        boolean cashOrCard = !Objects.isNull(req.get("isSalary")) && Boolean.parseBoolean(req.get("isSalary"));

        List<Integer> spendIdList; // список с SPEND.id полученный из templates для этого месяца

        Templates templates = ts.pushSpendToTemplate(spendId, amount, salaryOrPrepaid, cashOrCard); // искать template с такими же параметрами, если найден - вернуть его, если нет - добавить новый
        Integer dateId = Objects.nonNull(req.get("dateId")) && req.get("dateId").length() > 0 ? Integer.valueOf(req.get("dateId")) : ds.getTodaysDate().getId(); //использовать dateId с морды, иначе попробовать получить текущий месяц, иначе null

        if (msr.findAllByDateId(dateId).isPresent()) { // если по указанному dateId что-то найдено, получить список monthly_spends на данный dateId
            spendIdList = msr.findAllByDateId(dateId).get().stream().map(ms -> ms.getTemplates().getSpends().getId()).collect(Collectors.toList()); // положить в список SPEND.id
            if (!spendIdList.contains(Integer.parseInt(spendId))){ //если monthly_spends в этом месяце НЕ содержит spends с таким ID
                msr.save(setMonthlySpends(dateId, templates.getId(), 0));
            }
        } else { // если по указанному dateId НИЧЕГО НЕ найдено, значит это новый месяц, добавить в него template не глядя
            Dates date = new Dates();
            date.setDate(LocalDate.now());
            dr.save(date);
            dateId = date.getId();
            msr.save(setMonthlySpends(dateId, templates.getId(), 0));
        }
        return getMonthsDTOByDateID(dateId);
    }

    private MonthlySpends setMonthlySpends(Integer dateId, Integer spendId, Integer monthAmount) { // заполнить new MonthlySpends()
        MonthlySpends ms = new MonthlySpends();
        ms.setDateId(dateId);
        ms.setTemplateId(spendId);
        ms.setMonthAmount(monthAmount);
        return ms;
    }

    public List<MonthlySpendsDTO> deleteSpendFromMonth(String monthId) {
        MonthlySpends ms = msr.findOneById(Integer.valueOf(monthId)).orElseThrow(NotFoundException::new);
        Integer dateId = ms.getDateId();
        Integer templateId = ms.getTemplateId();
        msr.delete(ms);
        ts.deleteSpendFromTemplate(String.valueOf(templateId), String.valueOf(dateId));

        if(!msr.findAllByDateId(dateId).isPresent()) { // если месячных трат с таким dateId больше нет(удалил единственный), то удалить и дату(dates)
            ds.deleteDate(dateId);
        }

//        return getCurrentMonth();
        return getLastMonth();
    }

}


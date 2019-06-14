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
import java.util.*;
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
            throw new NotFoundException(); // если в dates нет сегодняшнего месяца и на морде выскакивает модальное окно
        }
    }

    public List<MonthlySpendsDTO> getLastMonth() {
        Dates date = ds.getLastDate(); // получить последнюю строку в таблице dates и вернуть для нее entity dates иначе new Dates().
        if (Objects.nonNull(date.getId())){ // проверить, вернулся заполненный Dates или пустой
            return getMonthsDTOByDateID(date.getId()); // вернуть найденную дату, если она найдена
        } else {
            throw new NotFoundException();
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

    public List<List<MonthlySpendsDTO>> getAllMonthlySpends() { // получить все месяцы
        List<Dates> dates = dr.findAll();
        List<List<MonthlySpendsDTO>> resultList = new ArrayList<>();
        dates.forEach(date -> resultList.add(new ArrayList<>(getMonthsDTOByDateID(date.getId()))));
        return resultList;
    }

    private List<MonthlySpends> getMonthlySpendsByDateId(Integer id){
        List<MonthlySpends> ms = new ArrayList<>();
        return msr.findAllByDateId(id).orElse(ms);
    }

    public void createMonthByEnabledTemplatesList() {
        createNewMonthByTemplatesList(tls.getEnabledTemplate().getId());
    }

    public void createMonthFromLastMonth() {
        MonthlySpends ms = msr.findTopByOrderByIdDesc();
        Integer templatesListId = ms.getDates().getTemplateListId();
        TemplatesList tl = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);
        createNewMonthByTemplatesList(tl.getId());
    }

    public void createNewMonthByTemplatesList(Integer templatesListId) {
        if (Objects.nonNull(templatesListId) && Objects.isNull(ds.getTodaysDate().getId())){ // проверка закончился ли текущий месяц
            Dates d = new Dates();
            d.setDate(LocalDate.now());
            d.setTemplateListId(templatesListId);
            d.setCompleted(false);
            dr.save(d);

            List<TemplatesDTO> templatesDTO = ts.getTemplatesDTOByTemplatesListId(templatesListId);
            if (templatesDTO.size() > 1){
                templatesDTO.forEach(template -> msr.save(setMonthlySpends(d.getId(), template.getTemplateId(), 0)));
            }
        }
    }

    public List<MonthlySpendsDTO> saveMonthAmount(Integer monthlySpendsId, Integer amount) {
        MonthlySpends ms = msr.findOneById(monthlySpendsId).orElseThrow(NotFoundException::new);
        if (!ms.getMonthAmount().equals(amount) && amount > 99){
            ms.setMonthAmount(amount);
            msr.save(ms);
        }
        return getMonthsDTOByDateID(ms.getDateId());
    }

    public List<MonthlySpendsDTO> pushSpendToMonth(Integer spendId, Integer monthlySpendsId, Integer amount, String isSalary, String isCash) {
        if (Objects.nonNull(spendId) && spendId > 0){

//            if (Objects.isNull(dateId)){ // если dateId не передается с фронта, значит месяц не создан или хз
//                Dates date = ds.getTodaysDate();// пробуем получить последний месяц
//                if (Objects.isNull(date.getId())){ // если в полученном месяце нет id, значит вернулся новый пустой месяц
//                    date.setDate(LocalDate.now());
//                    dr.save(date);
//                }
//            }

            Integer newAmount = Objects.isNull(amount) ? 0 : Integer.valueOf(amount);
            boolean newIsSalary = !Objects.isNull(isSalary) && Boolean.parseBoolean(isSalary);
            boolean newIsCash = !Objects.isNull(isCash) && Boolean.parseBoolean(isCash);
            Integer monthDateId = null;

            Templates templates = ts.pushSpendToTemplate(spendId, newAmount, newIsSalary, newIsCash); // искать template с такими же параметрами, если найден - вернуть его, если нет - добавить новый

            if (Objects.nonNull(monthlySpendsId)) { // если найдена строка с таким monthlySpendsId, значит месяц НЕ новый, добавляется в существующий
                Optional<MonthlySpends> monthlySpends = msr.findOneById(Integer.valueOf(monthlySpendsId));
                if (monthlySpends.isPresent()) monthDateId = monthlySpends.get().getDateId();
            } else { // если по указанному monthlySpendsId НИЧЕГО НЕ найдено
                Dates date = ds.getTodaysDate(); //  попробовать получить последний месяц
                if (Objects.isNull(date.getId())){ // если получить последний месяц не удалось, значит это новый месяц
                    date.setDate(LocalDate.now());
                    dr.save(date);
                    monthDateId = date.getId();
                } else { // если получить последний месяц удалось, значит попробовать сохранить в него?
                    monthDateId = date.getId();
                }
            }

            Optional<List<MonthlySpends>> msList = msr.findAllByDateId(monthDateId); //если dateId удалось получить
            if (msList.isPresent()){ // и по этому dateId найдены какие-то записи в таблице monthly_spends
                List<MonthlySpends> spendIdList = msList.get().stream().filter(
                        ms -> ms.getTemplates()
                                .getSpends()
                                    .getId()
                                        .equals(spendId))
                        .collect(Collectors.toList()); // положить в список те строки, в которых уже есть указанный spendId
                if (spendIdList.size() == 0){ // если таких spendId в этом месяце нет, то сохранить новый template
                    msr.save(setMonthlySpends(monthDateId, templates.getId(), 0));
                }
            } else msr.save(setMonthlySpends(monthDateId, templates.getId(), 0));

            return getMonthsDTOByDateID(monthDateId);
        } else throw new RuntimeException("SpendId not found!");
    }

    public List<MonthlySpendsDTO> editMonthSpend(Integer monthlySpendsId, Integer amount, String isSalary, String isCash) { // изменить template созданный в месяце, без участия шаблона
        if (Objects.nonNull(monthlySpendsId)){
            MonthlySpends ms = msr.findOneById(monthlySpendsId).orElseThrow(NotFoundException::new);
            Integer spendId = ms.getTemplates().getSpendId();
            Integer dateId = ms.getDateId();

            Integer newAmount = Objects.nonNull(amount) && amount > 99 // здесь и далее присвоить входной аргумент, если входного их нет то из существующего entity
                    ? amount
                    : ms.getTemplates().getAmount();

            Boolean newIsSalary = Objects.nonNull(isSalary) && !isSalary.isEmpty()
                    ? Boolean.parseBoolean(isSalary)
                    : ms.getTemplates().isSalary();

            Boolean newIsCash = Objects.nonNull(isCash) && !isCash.isEmpty()
                    ? Boolean.parseBoolean(isCash)
                    : ms.getTemplates().isCash();

            Templates t = ts.pushSpendToTemplate(spendId, newAmount, newIsSalary, newIsCash);
            ms.setTemplateId(t.getId());
            msr.save(ms);
            return getMonthsDTOByDateID(dateId);
        } else throw new NotFoundException();
    }

    private MonthlySpends setMonthlySpends(Integer dateId, Integer spendId, Integer monthAmount) { // просто заполнить и вернуть MonthlySpends()
        MonthlySpends ms = new MonthlySpends();
        ms.setDateId(dateId);
        ms.setTemplateId(spendId);
        ms.setMonthAmount(monthAmount);
        return ms;
    }

    public List<MonthlySpendsDTO> deleteSpendFromMonth(Integer monthId) {
        MonthlySpends ms = msr.findOneById(monthId).orElseThrow(NotFoundException::new);
        Integer dateId = ms.getDateId();
        Integer templateId = ms.getTemplateId();
        msr.delete(ms);
        ts.deleteTemplate(templateId, dateId);

        if(!msr.findAllByDateId(dateId).isPresent()) { // если месячных трат с таким dateId больше нет(удалил единственный), то удалить и дату(dates)
            ds.deleteDate(dateId);
        }

        return getLastMonth();
    }

    public Map<String, Integer> getTotalMonthAmounts (Integer dateId){
        Map<String, Integer> result = new HashMap<>();
        List<MonthlySpends> msList = msr.findAllByDateId(dateId).orElseThrow(NotFoundException::new);
        Integer amountSalaryCash = 0, amountSalaryCard = 0, amountPrepaidCash = 0, amountPrepaidCard = 0;
        for (MonthlySpends ms : msList) {
            amountSalaryCash = ms.getTemplates().isSalary() && ms.getTemplates().isCash() ? amountSalaryCash + ms.getTemplates().getAmount() : amountSalaryCash;
            amountSalaryCard = ms.getTemplates().isSalary() && !ms.getTemplates().isCash() ? amountSalaryCard + ms.getTemplates().getAmount() : amountSalaryCard;
            amountPrepaidCash = !ms.getTemplates().isSalary() && ms.getTemplates().isCash() ? amountPrepaidCash + ms.getTemplates().getAmount() : amountPrepaidCash;
            amountPrepaidCard = !ms.getTemplates().isSalary() && !ms.getTemplates().isCash() ? amountPrepaidCard + ms.getTemplates().getAmount() : amountPrepaidCard;
        }
        result.put("amountSalary", amountSalaryCash + amountSalaryCard);
        result.put("amountPrepaid", amountPrepaidCash + amountPrepaidCard);
        result.put("amountSalaryCash", amountSalaryCash);
        result.put("amountSalaryCard", amountSalaryCard);
        result.put("amountPrepaidCash", amountPrepaidCash);
        result.put("amountPrepaidCard", amountPrepaidCard);

        return result;
    }

}


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
import java.util.Objects;

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
    MonthlySpendsService mss;

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

    List<MonthlySpends> getMonthlySpendsByDateId(Integer id){
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

    public String checkBeforeCreateNewMonth(Integer dateId) {
        if (Objects.nonNull(dateId) && dateId > 0) {
            List<MonthlySpends> msList = msr.findAllByDateId(dateId).orElseThrow(NotFoundException::new);
            if (msList.get(0).getDates().getDate() == ds.getTodaysDate().getDate()){ // дата ежемесячных платежей НЕ совпадает с СЕГОДНЯШНЕЙ датой в dates, прошлый месяц закончен с точки зрения календаря
                if (checkMonthForCompletion(dateId)) { // каждая статья расходов пополнена необходимой суммой с точки зрения monthly_spend.amount >= templates.amount
                    createNewMonthByDateId(dateId);
                    return "";
                } else return "MONTH_OK.FULL_NOT";
            } else { // дата ежемесячных платежей совпадает с СЕГОДНЯШНЕЙ датой в dates, прошлый месяц еще не закончен с точки зрения календаря
                if (checkMonthForCompletion(dateId))
                    return "MONTH_NOT.FULL_OK";
                else return "MONTH_NOT.FULL_NOT"; // текущий календарный месяц еще НЕ закончен и статьи расходов НЕ пополнены необх суммами с точки зрения monthly_spend.amount < templates.amount
            }
        } else throw new RuntimeException("dateId cannot be NULL or less than 0");
    }

    public void createNewMonthByDateId(Integer dateId) {
        List<MonthlySpends> msList = msr.findAllByDateId(dateId).orElseThrow(NotFoundException::new);
        if (dr.findOneById(dateId).isPresent()){ // && msList.get(0).getDates().getDate() == dr.findOneById(dateId).get().getDate()

            if (Objects.nonNull(ds.getTodaysDate().getId())){ //проверка существует ли такой год+месяц в dates
                Dates date = new Dates();// если да, то все ок, создаем новую dates с месяцем +1 от найденного
                LocalDate d = LocalDate.now().plusMonths(1).withDayOfMonth(2); //с месяцем +1 от найденного //почему-то БД уменьшает на один день дату
                date.setDate(d);
                dr.save(date);

                msList.forEach(ms -> {
                    MonthlySpends monthlySpends = new MonthlySpends();
                    monthlySpends.setDateId(date.getId());
                    monthlySpends.setTemplateId(ms.getTemplateId());
                    monthlySpends.setMonthAmount(0);
                    msr.save(monthlySpends);
                });
            } else throw new RuntimeException("Something wrong, cause can't find current month in dates!");
        }
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
        if (!ms.getMonthAmount().equals(amount) && amount >= 0){
            ms.setMonthAmount(amount);
            msr.save(ms);
        }
        return getMonthsDTOByDateID(ms.getDateId());
    }

    public List<MonthlySpendsDTO> pushSpendToMonth(Integer spendId, Integer dateId) {
        if (Objects.nonNull(spendId) && spendId > 0 && Objects.nonNull(dateId) && dateId > 0){
            Templates template = ts.pushSpendToTemplate(spendId, 0, true, true); // искать template с такими же параметрами, если найден - вернуть его, если нет - добавить новый
            MonthlySpends ms = new MonthlySpends();
            msr.save(setMonthlySpends(dateId, template.getId(), 0));
            return getMonthsDTOByDateID(dateId);
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

    public Boolean checkMonthForCompletion(Integer dateId) {
        List<MonthlySpends> msList = msr.findAllByDateId(dateId).orElseThrow(NotFoundException::new);
        Long res = msList.stream().filter(ms -> ms.getMonthAmount() < ms.getTemplates().getAmount()).count();
        return res <= 0;
//        Integer templateAmount= msList.stream().mapToInt(ms -> ms.getTemplates().getAmount()).sum(); // сумма всех платежей согласно шаблону
//        Integer monthAmount= msList.stream().mapToInt(MonthlySpends::getMonthAmount).sum(); // сумма фактически внесенных в бюджет платежей

    }

}


package com.robo.service;

import com.robo.DTOModel.MonthlySpendsDTO;
import com.robo.Entities.Dates;
import com.robo.Entities.MonthlySpends;
import com.robo.Entities.Templates;
import com.robo.Entities.TemplatesList;
import com.robo.exceptions.NotFoundException;
import com.robo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
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
    TemplatesRepo tr;

    @Autowired
    TemplatesService ts;

    @Autowired
    DatesService ds;

    @Autowired
    DatesRepo dr;

    public List<MonthlySpendsDTO> getCurrentMonth() {// переписать метод, не нужно кидать 404
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
        } else { // если с таким dateId ничего не найдено, вернуть пустой список, для добавления пользователем вручную
            return new ArrayList<>();
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
        createNewMonthByTemplatesListId(tls.getEnabledTemplate().getId());
    }

    public void createMonthFromLastMonth() {
        MonthlySpends ms = msr.findTopByOrderByIdDesc();
        createNewMonthByDateId(ms.getDateId());
    }

    public ResponseEntity checkLastMonthBeforeCreateNewMonth() {
        Integer dateId = msr.findTopByOrderByIdDesc().getDateId();
        return checkBeforeCreateNewMonth(dateId);
    }

    public ResponseEntity checkBeforeCreateNewMonth(Integer dateId) {
        if (Objects.nonNull(dateId) && dateId > 0) {
            List<MonthlySpends> msList = msr.findAllByDateId(dateId).orElseThrow(NotFoundException::new);
            if (msList.get(0).getDates().getDate().getYear() != LocalDate.now().getYear()
                || msList.get(0).getDates().getDate().getMonth() != LocalDate.now().getMonthValue()){ // дата ежемесячных платежей НЕ совпадает с СЕГОДНЯШНЕЙ датой в dates, прошлый месяц закончен с точки зрения календаря
                    if (checkMonthForCompletion(dateId)) { // каждая статья расходов пополнена необходимой суммой с точки зрения monthly_spend.amount >= templates.amount
                        createNewMonthByDateId(dateId);
                        return new ResponseEntity<>("MONTH_OK.FULL_OK", HttpStatus.OK);
                    } else return new ResponseEntity<>("MONTH_OK.FULL_NOT", HttpStatus.OK);
            } else { // дата ежемесячных платежей совпадает с СЕГОДНЯШНЕЙ датой в dates, прошлый месяц еще не закончен с точки зрения календаря
                if (checkMonthForCompletion(dateId))
                    return new ResponseEntity<>("MONTH_NOT.FULL_OK", HttpStatus.OK);
                else  return new ResponseEntity<>("MONTH_NOT.FULL_NOT", HttpStatus.OK); // текущий календарный месяц еще НЕ закончен и статьи расходов НЕ пополнены необх суммами с точки зрения monthly_spend.amount < templates.amount
            }
        } else throw new RuntimeException("dateId cannot be NULL or less than 0");
    }

    public void createNewMonthByDateId(Integer dateId) {
        List<MonthlySpends> msList = msr.findAllByDateId(dateId).orElseThrow(NotFoundException::new);
        Dates date = ds.generateDate();
        System.out.println("Dates date = ds.generateDate() = " + date);
        if (!msList.isEmpty()) {
            msList.forEach(ms -> {
                MonthlySpends monthlySpends = new MonthlySpends();
                monthlySpends.setDateId(date.getId());
                monthlySpends.setTemplateId(ms.getTemplateId());
                monthlySpends.setMonthAmount(0);
                msr.save(monthlySpends);
            });
        }else throw new RuntimeException("Something wrong, cause can't find monthly_spends for date_id: " + dateId);
    }

    public void createNewMonthByTemplatesListId(Integer templatesListId) {
        if (Objects.nonNull(templatesListId) && Objects.isNull(ds.getTodaysDate().getId())){ // проверка закончился ли текущий месяц
            Dates d = new Dates();
            d.setDate(java.sql.Date.valueOf(LocalDate.now()));
            d.setTemplateListId(templatesListId);
            d.setCompleted(false);
            dr.save(d);

            TemplatesList tl = tlr.findOneById(templatesListId).orElseThrow(NotFoundException::new);
            String[] tmpIds = tl.getTemplateId().split(",");
            Arrays.stream(tmpIds).forEach(tmpId -> {
                Templates template = tr.findOneById(Integer.valueOf(tmpId)).orElseThrow(NotFoundException::new);
                MonthlySpends ms = new MonthlySpends();
                ms.setDateId(d.getId());
                ms.setTemplateId(template.getId());
                ms.setMonthAmount(0);
                msr.save(ms);
            });
        }
    }

    public List<MonthlySpendsDTO> saveMonthAmount(Integer monthlySpendsId, Integer amount) {
        MonthlySpends ms = msr.findOneById(monthlySpendsId).orElseThrow(NotFoundException::new);
        Integer newAmount = Objects.isNull(amount) || amount < 0 ? 0 : amount;
        if (!ms.getMonthAmount().equals(newAmount)){
            ms.setMonthAmount(newAmount);
            msr.save(ms);
        }
        return getMonthsDTOByDateID(ms.getDateId());
    }

    public List<MonthlySpendsDTO> pushSpendToMonth(Integer spendId, Integer dateId) {
        if (Objects.nonNull(spendId) && spendId > 0 && Objects.nonNull(dateId) && dateId > 0){
            Templates template = ts.pushSpendToTemplate(spendId, 0, true, true); // искать template с такими же параметрами, если найден - вернуть его, если нет - добавить новый
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

    public void deleteMonth(Integer dateId){
        List<MonthlySpends> msList = msr.findAllByDateId(dateId).orElseThrow(NotFoundException::new);
        msList.forEach(ms -> {
            Integer templateId = ms.getTemplateId();
            msr.delete(ms);
            ts.deleteTemplate(templateId);
        });
    }

    private Boolean checkMonthForCompletion(Integer dateId) { // проверка месяца на завершенность с точки зрения платежей
        List<MonthlySpends> msList = msr.findAllByDateId(dateId).orElseThrow(NotFoundException::new);
        Long res = msList.stream().filter(ms -> ms.getMonthAmount() < ms.getTemplates().getAmount()).count();
        return res <= 0;
    }

    public List<MonthlySpendsDTO> plusMonthAmount(Integer monthlySpendsId, Integer plusAmount) {
        MonthlySpends ms = msr.findOneById(monthlySpendsId).orElseThrow(NotFoundException::new);
        if (Objects.nonNull(plusAmount) && plusAmount > 0) {
            ms.setMonthAmount(ms.getMonthAmount() + plusAmount);
            msr.save(ms);
        }
        return getMonthsDTOByDateID(ms.getDateId());
    }
}


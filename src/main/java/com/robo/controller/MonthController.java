package com.robo.controller;

import com.robo.DTOModel.MonthlySpendsDTO;
import com.robo.Entities.Spends;
import com.robo.Entities.User;
import com.robo.repository.SpendsRepo;
import com.robo.service.MonthlySpendsService;
import com.robo.service.SpendsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("month")
public class MonthController {

    @Autowired
    MonthlySpendsService mss;

    @Autowired
    SpendsService ss;

    @Autowired
    SpendsRepo sr;

    private ThreadLocal<User> userSession = new ThreadLocal<>();

//    @ModelAttribute
//    public void models(Model model, @AuthenticationPrincipal User user) throws Exception {
//
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
//            model.addAttribute("month", mss.getCurrentMonth());
//        }
//    }

    @GetMapping("/all")
    public List<List<MonthlySpendsDTO>> getAllMonths() {
        return mss.getAllMonthlySpends();
    }

    @GetMapping
    public List<MonthlySpendsDTO> getLastMonth() {
        return mss.getCurrentMonth();
    }

    @GetMapping("/getPreviousMonth")
    public List<MonthlySpendsDTO> getPreviousMonth() {
        return mss.getLastMonth();
    }

    @GetMapping("/getMonthlyMissingSpends")
    public List<Spends> getMonthlyMissingSpends(@RequestParam(name = "monthlyDateId") Integer monthlyDateId){
        if (Objects.nonNull(monthlyDateId) && monthlyDateId > 0){
            return ss.getMonthlyMissingSpends(monthlyDateId);
        } else {
            return sr.findAll();
        }
    }

//    @GetMapping("/getMonthlyMissingSpends")
//    public List<Spends> getMonthlyMissingSpends(@RequestParam(name = "monthlySpendsId") String monthlySpendsId){
//        return ss.getMonthlyMissingSpends(Integer.valueOf(monthlySpendsId));
//    }

    @GetMapping("/createFromEnabled")
    public List<MonthlySpendsDTO> createMonthFromEnabledTemplatesList(){
        mss.createMonthByEnabledTemplatesList();
        return getLastMonth();
    }

    @GetMapping("/createFromLastMonth")
    public List<MonthlySpendsDTO> createMonthFromLastMonth(){
        mss.createMonthFromLastMonth();
        return getLastMonth();
    }

    @PutMapping("/createMonthFromTemplatesList")
    public void createMonthFromTemplatesList(@RequestParam(name = "templateListId")  Integer templateListId){
        mss.createNewMonthByTemplatesList(templateListId);
    }

    @GetMapping("/getMonthWithDateId")
    public List<MonthlySpendsDTO> getMonthWithDateId(@RequestParam(name = "dateId") String dateId){
        return mss.getMonthsDTOByDateID(Integer.valueOf(dateId));
    }


    @PutMapping("/saveMonthAmount") //
    public List<MonthlySpendsDTO> saveMonthAmount(@RequestParam(name = "monthlySpendsId") Integer monthlySpendsId,
                                                 @RequestParam(name = "amount") Integer amount){
        return mss.saveMonthAmount(monthlySpendsId, amount);
    }

    @PutMapping("/editMonthSpend") //
    public List<MonthlySpendsDTO> editMonthSpend(@RequestParam(name = "monthlySpendsId") Integer monthlySpendsId,
                                                 @RequestParam(name = "amount") Integer amount,
                                                 @RequestParam(name = "isSalary") String isSalary,
                                                 @RequestParam(name = "isCash") String isCash){
        return mss.editMonthSpend(monthlySpendsId, amount, isSalary, isCash);
    }

    @PutMapping("/pushSpendToMonth") //add spend to template and then to monthly_spends (spendId, amount, isCash, isSalary)
    public List<MonthlySpendsDTO> pushSpendToMonth(@RequestParam(name = "spendId") Integer spendId,
                                                   @RequestParam(name = "monthlySpendsId") Integer monthlySpendsId,
                                                   @RequestParam(name = "amount") Integer amount,
                                                   @RequestParam(name = "isSalary") String isSalary,
                                                   @RequestParam(name = "isCash") String isCash){
        return mss.pushSpendToMonth(spendId, monthlySpendsId, amount, isSalary, isCash);
    }

    @DeleteMapping("/deleteSpendFromMonth")
    public List<MonthlySpendsDTO> deleteSpendFromMonth(@RequestParam(name = "monthId") Integer monthId){
        return mss.deleteSpendFromMonth(monthId);
    }

}
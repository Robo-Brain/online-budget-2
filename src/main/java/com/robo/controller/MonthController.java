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
import java.util.Map;

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
    public List<Spends> getMonthlyMissingSpends(@RequestParam(name = "monthlyDateId") String monthlyDateId){
        if (monthlyDateId.length() > 0 && !monthlyDateId.equals("undefined")){
            return ss.getMonthlyMissingSpends(Integer.valueOf(monthlyDateId));
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
        mss.createMonthFromEnabledTemplatesList();
        return getLastMonth();
    }

    @GetMapping("/createFromLastMonth")
    public List<MonthlySpendsDTO> createMonthFromLastMonth(){
        mss.createMonthFromLastMonth();
        return getLastMonth();
    }

    @GetMapping("/getMonthWithDateId")
    public List<MonthlySpendsDTO> getMonthWithDateId(@RequestParam(name = "dateId") String dateId){
        return mss.getMonthsDTOByDateID(Integer.valueOf(dateId));
    }

//    @PutMapping("/editMonthAmount")
//    public List<MonthlySpendsDTO> editMonthAmount(@RequestParam(name = "monthlySpendsId") String monthlySpendsId, @RequestParam(name = "amount") String amount){
//        return mss.editMonthAmount(monthlySpendsId, amount);
//    }

    @PutMapping("/editMonthSpend")
    public List<MonthlySpendsDTO> editMonthSpend(@RequestParam Map<String,String> requestParams){
        return mss.editMonthSpend(requestParams);
    }

    @PutMapping("/pushSpendToMonth") //add spend to template and then to monthly_spends (spendId, amount, isCash, isSalary)
    public List<MonthlySpendsDTO> pushSpendToMonth(@RequestParam Map<String,String> requestParams){
        return mss.pushSpendToMonth(requestParams);
    }

    @DeleteMapping("/deleteSpendFromMonth")
    public List<MonthlySpendsDTO> deleteSpendFromMonth(@RequestParam(name = "monthId") String monthId){
        return mss.deleteSpendFromMonth(monthId);
    }

}
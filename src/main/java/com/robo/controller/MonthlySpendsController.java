package com.robo.controller;

import com.robo.DTOModel.MonthlySpendsDTO;
import com.robo.Entities.Spends;
import com.robo.Entities.User;
import com.robo.repository.SpendsRepo;
import com.robo.service.MonthlySpendsService;
import com.robo.service.SpendsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("month")
public class MonthlySpendsController {

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

    @GetMapping
    public List<MonthlySpendsDTO> getLastMonth() {
            return mss.getLastMonth();
    }

    @GetMapping("/all")
    public List<List<MonthlySpendsDTO>> getAllMonths() {
        return mss.getAllMonthlySpends();
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

    @PostMapping("/createFromTemplateListId")
    public List<MonthlySpendsDTO> createMonthFromTemplateListId(@RequestParam(name = "templateListId") Integer templateListId){
        mss.createNewMonthByTemplatesListId(templateListId);
        return getLastMonth();
    }

    @GetMapping("/checkBeforeCreateNewMonth")
    public ResponseEntity checkBeforeCreateNewMonth(@RequestParam(name = "dateId") Integer dateId){
        return mss.checkBeforeCreateNewMonth(dateId);
    }
    @GetMapping("/checkLastMonthBeforeCreateNewMonth")
    public ResponseEntity checkLastMonthBeforeCreateNewMonth(){
        return mss.checkLastMonthBeforeCreateNewMonth();
    }

    @PutMapping("/createNewMonthByPreviousMonth")
    public List<MonthlySpendsDTO> createNewMonthByPreviousMonth(){
        return mss.createNewMonthByPreviousMonth();
    }

    @PutMapping("/fillCurrentMonthByPreviousMonth")
    public List<MonthlySpendsDTO> fillCurrentMonthByPreviousMonth(@RequestParam(name = "dateId") Integer dateId){
        mss.fillCurrentMonthByPreviousMonth(dateId);
        return getMonthWithDateId(dateId);
    }

    @PutMapping("/createNewMonthByTemplatesListId")
    public void createMonthByTemplatesList(@RequestParam(name = "templateListId") Integer templateListId){
        mss.createNewMonthByTemplatesListId(templateListId);
    }

    @PutMapping("/fillCurrentMonthByTemplatesListId")
    public List<MonthlySpendsDTO> fillCurrentMonthByTemplatesListId(@RequestParam(name = "templateListId") Integer templateListId, @RequestParam(name = "dateId") Integer dateId){
        return mss.fillCurrentMonthByTemplatesListId(templateListId, dateId);
    }

    @GetMapping("/getMonthWithDateId")
    public List<MonthlySpendsDTO> getMonthWithDateId(@RequestParam(name = "dateId") Integer dateId){
        return mss.getMonthsDTOByDateID(dateId);
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
                                                   @RequestParam(name = "dateId") Integer dateId){
        return mss.pushSpendToMonth(spendId, dateId);
    }

    @DeleteMapping("/deleteSpendFromMonth")
    public List<MonthlySpendsDTO> deleteSpendFromMonth(@RequestParam(name = "monthId") Integer monthId){
        return mss.deleteSpendFromMonth(monthId);
    }

    @DeleteMapping("/deleteMonth")
    public List<MonthlySpendsDTO> deleteMonth(@RequestParam(name = "dateId") Integer dateId){
        mss.deleteMonth(dateId);
        return mss.getLastMonth();
    }

    @PutMapping("/plusMonthAmount")
    public List<MonthlySpendsDTO> plusMonthAmount(@RequestParam(name = "monthlySpendsId") Integer monthlySpendsId, @RequestParam(name = "plusAmount") Integer plusAmount){
        return mss.plusMonthAmount(monthlySpendsId, plusAmount);
    }

    @GetMapping("/getPreviousMonthOverpayment")
    public List<MonthlySpendsDTO> getPreviousMonthOverpayment(){
        return mss.getPreviousMonthOverpayment();
    }

    @PostMapping("/transferOverpaymentToCurrentMonth")
    public List<MonthlySpendsDTO> transferOverpaymentToCurrentMonth(@RequestParam(name = "dateId") Integer dateId, @RequestParam(name = "normalize") Boolean normalize){// current month date.id
        mss.transferOverpaymentToCurrentMonth(dateId, normalize);
        return getLastMonth();
    }

    @PostMapping("/transferSelectedOverpaymentToCurrentMonth")
    public List<MonthlySpendsDTO> transferSelectedOverpaymentToCurrentMonth(@RequestParam(name = "dateId") Integer dateId,
                                                                            @RequestParam(name = "overpaymentId") List<Integer> overpaymentId,
                                                                            @RequestParam(name = "normalize") Boolean normalize){// current month date.id
        System.out.println(">>> " + overpaymentId);
        mss.transferSelectedOverpaymentToCurrentMonth(dateId, overpaymentId, normalize);
        return getLastMonth();
    }

}
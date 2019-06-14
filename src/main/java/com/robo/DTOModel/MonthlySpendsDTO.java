package com.robo.DTOModel;

import com.robo.Entities.MonthlySpends;
import lombok.*;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlySpendsDTO {

    @Getter
    @Setter
    Integer monthlySpendsId;

    @Getter
    @Setter
    Integer dateId;

    @Getter
    @Setter
    LocalDate date;

    @Getter
    @Setter
    String templateListName;

//    @Getter
//    @Setter
//    Integer templateListId;

//    @Getter
//    @Setter
//    boolean completed;

    @Getter
    @Setter
    Integer templateId;

    @Getter
    @Setter
    String spendName;

    @Getter
    @Setter
    Integer templateAmount;

    @Getter
    @Setter
    Integer monthAmount;

    @Getter
    @Setter
    boolean isCash;

    @Getter
    @Setter
    boolean isSalary;

    public MonthlySpendsDTO (MonthlySpends ms){
        this.monthlySpendsId = ms.getId(); // monthly_spends.id
        this.dateId = ms.getDates().getId(); // dates.id
        this.date = ms.getDates().getDate(); // dates.date
        this.templateId = ms.getTemplateId(); // monthly_spends.spend_id
        this.spendName = ms.getTemplates().getSpends().getName(); // spends.name
        this.templateAmount = ms.getTemplates().getAmount(); // templates.amount
        this.isCash = ms.getTemplates().isCash(); // templates.amount
        this.isSalary = ms.getTemplates().isSalary(); // templates.amount
        this.monthAmount = ms.getMonthAmount(); // monthly_spends.month_amount
    }

}

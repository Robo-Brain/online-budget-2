package com.robo.DTOModel;

import lombok.*;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllMonthsDTO {

    @Getter
    @Setter
    Integer dateId;

    @Getter
    @Setter
    Integer monthlySpendsId;

    @Getter
    @Setter
    LocalDate date;

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

    @Getter
    @Setter
    boolean haveNotice;

}

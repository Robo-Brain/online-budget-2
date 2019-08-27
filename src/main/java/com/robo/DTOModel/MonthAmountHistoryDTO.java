package com.robo.DTOModel;

import lombok.*;

import java.sql.Time;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthAmountHistoryDTO {

    @Getter
    @Setter
    java.sql.Date date;

    @Getter
    @Setter
    Time time;

    @Getter
    @Setter
    Integer amount;

    @Getter
    @Setter
    String comment;

}

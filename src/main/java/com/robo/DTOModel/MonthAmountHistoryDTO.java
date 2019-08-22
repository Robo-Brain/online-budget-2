package com.robo.DTOModel;

import lombok.*;

import java.sql.Time;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthAmountHistoryDTO {

    @Getter
    @Setter
    java.sql.Date date;

    @Getter
    @Setter
    Map<Time, Integer> map;

}

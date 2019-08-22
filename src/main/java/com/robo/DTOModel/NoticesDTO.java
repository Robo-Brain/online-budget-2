package com.robo.DTOModel;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoticesDTO {

    @Getter
    @Setter
    Integer noticeId;

    @Getter
    @Setter
    Integer monthlySpendId;

    @Getter
    @Setter
    String text;

    @Getter
    @Setter
    Boolean remind;

    @Getter
    @Setter
    java.sql.Date date;

    @Getter
    @Setter
    java.sql.Date creationDate;

    @Getter
    @Setter
    String spendName;

}

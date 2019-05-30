package com.robo.DTOModel;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TemplatesDTO {

    @Getter
    @Setter
    Integer templateId;

    @Getter
    @Setter
    Integer spendId;

    @Getter
    @Setter
    String spendName;

    @Getter
    @Setter
    Integer amount;

    @Getter
    @Setter
    boolean salaryOrPrepaid;

    @Getter
    @Setter
    boolean cashOrCard;

}

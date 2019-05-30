package com.robo.DTOModel;

import lombok.*;
import org.springframework.lang.Nullable;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TemplatesListDTO {

    @Getter
    @Setter
    Integer id;

    @Getter
    @Setter
    String templateName;

    @Getter
    @Setter
    boolean templateEnabled;

    @Getter
    @Setter
    @Nullable
    List<TemplatesDTO> templatesDTOList;

//    @Getter
//    @Setter
//    @Nullable
//    List<Templates> templatesList;

}

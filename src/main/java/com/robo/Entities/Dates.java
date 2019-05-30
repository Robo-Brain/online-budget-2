package com.robo.Entities;

import lombok.*;
import org.springframework.lang.Nullable;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table
public class Dates {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @Getter
    @Setter
    Integer id;

    @Column(name = "date", nullable = false)
    @Getter
    @Setter
    LocalDate date;

    @Column(name = "template_list_id", nullable = false)
    @Getter
    @Setter
    @Nullable
    Integer templateListId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "template_list_id", updatable = false, insertable = false)
    private TemplatesList templatesList;

//    @JsonIgnore
//    @OneToMany(fetch = FetchType.EAGER, mappedBy = "dates")
//    private List<MonthlySpends> monthlySpends;

    @Column(name = "completed")
    @Getter
    @Setter
    @Nullable
    boolean completed;

}

package com.robo.Entities;

import lombok.*;

import javax.persistence.*;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "monthly_spends")
public class MonthlySpends {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @Getter
    @Setter
    Integer id;

    @Column(name = "date_id", nullable = false)
    @Getter
    @Setter
    Integer dateId;

    @Getter
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "date_id", updatable = false, insertable = false)
    private Dates dates;

    @Column(name = "template_id", nullable = false)
    @Getter
    @Setter
    Integer templateId;

    @Getter
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "template_id", updatable = false, insertable = false)
    private Templates templates;

    @Column(name = "month_amount", nullable = false)
    @Getter
    @Setter
    Integer monthAmount;

    @Getter
    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "monthly_spend_id")
    private List<Notices> noticesList;

}

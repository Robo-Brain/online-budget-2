package com.robo.Entities;

import lombok.*;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import javax.persistence.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "mont_amount_history")
public class MonthAmountHistory {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @Getter
    @Setter
    Integer id;

    @Column(name = "date", nullable = false)
    @Getter
    @Setter
    java.sql.Date date;

    @Column(name = "time", nullable = false)
    @Getter
    @Setter
    java.sql.Time time;

    @Column(name = "monthly_spends_id", nullable = false)
    @Getter
    @Setter
    @NonNull
    Integer monthlySpendsId;

    @Column(name = "amount")
    @Getter
    @Setter
    @NonNull
    Integer amount;

    @Column(name = "comment")
    @Getter
    @Setter
    @Nullable
    String comment;
}

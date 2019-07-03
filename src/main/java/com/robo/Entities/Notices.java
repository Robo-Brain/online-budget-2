package com.robo.Entities;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table
public class Notices {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @Getter
    @Setter
    Integer id;

    @Column(name = "monthly_spend_id")
    @Getter
    @Setter
    Integer monthlySpendId;

    @Column(name = "text", nullable = false)
    @Getter
    @Setter
    String text;

    @Column(name = "remind", nullable = false)
    @Getter
    @Setter
    boolean remind;

    @Column(name = "creationDate", nullable = false)
    @Getter
    @Setter
    LocalDate creationDate;

}

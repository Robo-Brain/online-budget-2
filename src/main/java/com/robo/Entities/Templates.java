package com.robo.Entities;

import lombok.*;

import javax.persistence.*;
import java.util.Objects;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table
public class Templates { //it's actually some kind of specific payment, like: credit, food, car, etc

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @Getter
    @Setter
    Integer id;

    @Column(name = "spend_id", nullable = false)
    @Getter
    @Setter
    Integer spendId;

    @Getter
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "spend_id", updatable = false, insertable = false)
    private Spends spends;

    @Column(name = "amount", nullable = false)
    @Getter
    @Setter
    Integer amount;

    @Column(name = "salary_or_prepaid", nullable = false)
    @Getter
    @Setter
    boolean salaryOrPrepaid;

    @Column(name = "cash_or_card", nullable = false)
    @Getter
    @Setter
    boolean cashOrCard;

    @Override
    public boolean equals(Object other) {
        if (!(other instanceof Templates)) {
            return false;
        }

        Templates that = (Templates) other;

        return this.spendId.equals(that.spendId)
                && this.amount.equals(that.amount)
                && this.salaryOrPrepaid == that.salaryOrPrepaid
                && this.cashOrCard == that.cashOrCard;
    }

    @Override
    public int hashCode() {
        return Objects.hash(spendId, amount, salaryOrPrepaid, cashOrCard);
    }

}

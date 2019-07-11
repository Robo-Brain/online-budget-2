package com.robo.Entities;

import lombok.*;

import javax.persistence.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table
public class Spends {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @Getter
    @Setter
    Integer id;

    @Column(name = "name", nullable = false)
    @Getter
    @Setter
    String name;

    public Spends(String name) {
        this.name = name;
    }

}

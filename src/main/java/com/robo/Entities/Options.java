package com.robo.Entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "options")
public class Options {

    @Id
    @Getter
    @Setter
    @Column(name="user_id")
    String userId;

    @Column(name="properties")
    @Getter
    @Setter
    String properties;
//    @Column(name="properties")
//    @Convert(converter = JpaConverterJson.class)
//    @Getter
//    @Setter
//    private LinkedHashMap<String, String> properties;
//
    @Override
    public String toString() {
        return "Options{" +
                "userId='" + userId + '\'' +
                ", properties=" + properties +
                '}';
    }
}

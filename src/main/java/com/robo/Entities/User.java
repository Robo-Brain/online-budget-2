package com.robo.Entities;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table
public class User {

    @Id
    @Getter
    @Setter
    private String id;

    @Getter
    @Setter
    private String name;

    @Getter
    @Setter
    private String userpic;

    @Getter
    @Setter
    private String email;

    @Getter
    @Setter
    private LocalDateTime lastVisit;

    public User(String id, String name, String userpic, String email) {
        this.id = id;
        this.name = name;
        this.userpic = userpic;
        this.email = email;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", userpic='" + userpic + '\'' +
                ", email='" + email + '\'' +
                ", lastVisit=" + lastVisit +
                '}';
    }
}

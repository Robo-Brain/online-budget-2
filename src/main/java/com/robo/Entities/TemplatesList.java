package com.robo.Entities;

import lombok.*;
import org.springframework.lang.Nullable;

import javax.persistence.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "templates_list")
public class TemplatesList {

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

    @Column(name = "template_id", nullable = true)
    @Getter
    @Setter
    @Nullable
    String templateId;

    @Column(name = "enabled", nullable = false)
    @Getter
    @Setter
    boolean enabled;

    public TemplatesList(String name) {
        this.name = name;
        this.enabled = false;
    }
}

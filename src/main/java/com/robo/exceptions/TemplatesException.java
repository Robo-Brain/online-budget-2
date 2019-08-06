package com.robo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public class TemplatesException {

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class TemplateDuplicates extends BaseException {
        public TemplateDuplicates() {
            super("td");
        }
    }

}

package com.robo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public class DatesException {

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class NoDates extends BaseException {
        public NoDates() {
            super("nd");
        }
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class DateWOSpends extends BaseException {
        public DateWOSpends() {
            super("dwos");
        }
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public static class TooManyDates extends BaseException {
        public TooManyDates() {
            super("tmd");
        }

    }

}

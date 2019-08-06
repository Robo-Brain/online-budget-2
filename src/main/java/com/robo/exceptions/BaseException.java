package com.robo.exceptions;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
class BaseException extends RuntimeException {

    @Getter
    @Setter
    private String errorCode;

    BaseException(String errorCode) {
        super(errorCode);
    }

}

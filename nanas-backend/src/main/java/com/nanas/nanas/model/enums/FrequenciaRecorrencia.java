package com.nanas.nanas.model.enums;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum FrequenciaRecorrencia {
    DIARIA,
    SEMANAL,
    MENSAL,
    ANUAL
}

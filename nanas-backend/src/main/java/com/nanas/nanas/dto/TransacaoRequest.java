package com.nanas.nanas.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoRequest {
    private String description;
    private BigDecimal amount;
    private String type;
    private String date;
}


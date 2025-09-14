package com.nanas.nanas.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoResponse {
    private Integer id;
    private String description;
    private BigDecimal amount;
    private String type;
    private String date;
}


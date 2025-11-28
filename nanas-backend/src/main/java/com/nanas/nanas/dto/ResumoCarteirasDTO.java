package com.nanas.nanas.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumoCarteirasDTO {
    private BigDecimal saldoTotal;
    private List<CarteiraResumoDTO> carteiras;
}

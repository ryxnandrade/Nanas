package com.nanas.nanas.mapper;

import com.nanas.nanas.dto.TransacaoCartaoCreditoDTO;
import com.nanas.nanas.model.TransacaoCartaoCredito;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TransacaoCartaoCreditoMapper {

    TransacaoCartaoCreditoMapper INSTANCE = Mappers.getMapper(TransacaoCartaoCreditoMapper.class);
    @Mapping(target = "cartaoCreditoId", source = "cartaoCredito.id")
    @Mapping(target = "categoriaId", source = "categoria.id")
    @Mapping(target = "usuarioId", source = "usuario.id")
    TransacaoCartaoCreditoDTO toDTO(TransacaoCartaoCredito entity);

    @Mapping(target = "cartaoCredito", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    TransacaoCartaoCredito toEntity(TransacaoCartaoCreditoDTO dto);
}

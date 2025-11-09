package com.nanas.nanas.mapper;

import com.nanas.nanas.dto.CartaoCreditoDTO;
import com.nanas.nanas.model.CartaoCredito;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CartaoCreditoMapper {

    CartaoCreditoMapper INSTANCE = Mappers.getMapper(CartaoCreditoMapper.class);

    @Mapping(target = "usuario.id", source = "usuarioId")
    CartaoCredito toEntity(CartaoCreditoDTO dto);

    @Mapping(target = "usuarioId", source = "usuario.id")
    CartaoCreditoDTO toDTO(CartaoCredito entity);
}

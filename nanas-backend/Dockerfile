# ===========================================
# Dockerfile para Backend Spring Boot
# Deploy no Render.com
# ===========================================

# Etapa de build
FROM maven:3.8.6-openjdk-11-slim AS build
WORKDIR /app

# Copia arquivos de dependências primeiro (para cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código fonte e compila
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa de execução
FROM openjdk:11-jre-slim
WORKDIR /app

# Cria usuário não-root para segurança
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copia o JAR da etapa de build
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta (Render usa PORT variável de ambiente)
EXPOSE 8080

# Variáveis de ambiente (serão sobrescritas pelo Render)
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT}/actuator/health || exit 1

# Comando de inicialização
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

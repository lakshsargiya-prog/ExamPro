package com.exampro.config;

import com.exampro.controller.AuthController;
import com.exampro.controller.HomeController;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

@Configuration
public class OpenApiConfig {

    public static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ExamPro API")
                        .description("Online Examination and Assessment System REST API")
                        .version("1.0.0"))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token to access protected endpoints")));
    }

    @Bean
    public OperationCustomizer customizeOperations() {
        return (operation, handlerMethod) -> {
            Class<?> beanType = handlerMethod.getBeanType();
            if (beanType.equals(AuthController.class) || beanType.equals(HomeController.class)) {
                operation.setSecurity(Collections.emptyList());
            }
            return operation;
        };
    }
}


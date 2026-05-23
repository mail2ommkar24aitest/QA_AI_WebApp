package utils;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;

public class ApiUtils {

    /**
     * Common request specification for Petstore API
     */
    public static RequestSpecification getRequestSpec() {
        return new RequestSpecBuilder()
                .setContentType(ContentType.JSON)
                .setAccept(ContentType.JSON)
                .setRelaxedHTTPSValidation()
                .build();
    }

    /**
     * MCP Validation: Check if response contains any sensitive headers or data
     * (Example placeholder for security validation logic)
     */
    public static boolean isSecureResponse(io.restassured.response.Response response) {
        // Check for common sensitive headers that shouldn't be exposed
        String server = response.getHeader("Server");
        // Simple check: Server header shouldn't be too descriptive
        return server == null || !server.contains("DetailedVersionInfo");
    }
}

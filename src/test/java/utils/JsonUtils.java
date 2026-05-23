package utils;

import io.restassured.response.Response;

/**
 * JsonUtils - Helper methods for working with JSON responses.
 */
public class JsonUtils {

    /**
     * Extracts a value from a JSON response using a JSON path expression.
     *
     * @param response - the API response object
     * @param jsonPath - the JSON path to extract (e.g., "data.id", "token")
     * @return the value at the given JSON path
     *
     * Example usage:
     *   String token = JsonUtils.getJsonValue(response, "token");
     *   int page = JsonUtils.getJsonValue(response, "page");
     */
    public static <T> T getJsonValue(Response response, String jsonPath) {
        return response.jsonPath().get(jsonPath);
    }
}

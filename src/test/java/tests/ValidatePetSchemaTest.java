package tests;

import base.BaseTest;
import io.restassured.module.jsv.JsonSchemaValidator;
import org.testng.annotations.Test;
import utils.ApiUtils;
import java.io.File;
import static io.restassured.RestAssured.given;

public class ValidatePetSchemaTest extends BaseTest {

    @Test(description = "Validate JSON Schema for Get Pet by ID API")
    public void testPetResponseSchema() {
        // Use a known valid ID (1247L is often available on Petstore)
        long petId = 1247L;

        given()
            .spec(ApiUtils.getRequestSpec())
            .pathParam("petId", petId)
        .when()
            .get("/pet/{petId}")
        .then()
            .statusCode(200)
            .log().ifValidationFails()
            // Strict Schema Validation
            .body(JsonSchemaValidator.matchesJsonSchema(
                    new File("src/test/resources/schemas/pet-schema.json")));
        
        System.out.println("JSON Schema Validation passed for Pet ID: " + petId);
    }
}

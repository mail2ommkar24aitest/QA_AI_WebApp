package tests;

import base.BaseTest;
import io.restassured.module.jsv.JsonSchemaValidator;
import org.testng.annotations.Test;
import utils.ApiUtils;
import java.io.File;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class GetPetTest extends BaseTest {

    @Test
    public void testGetPetById() {
        // Using a hardcoded ID for demonstration or you can link it to CreatePetTest
        long petId = 1247L; // Example ID from Swagger or existing one

        given()
            .spec(ApiUtils.getRequestSpec())
            .pathParam("petId", petId)
        .when()
            .get("/pet/{petId}")
        .then()
            .statusCode(200)
            .body("id", equalTo((int) petId))
            .body(JsonSchemaValidator.matchesJsonSchema(
                    new File("src/test/resources/schemas/pet-schema.json")));
    }

    @Test
    public void testFindPetByIdSchemaValidation() {
        long petId = 1247L;

        given()
            .spec(ApiUtils.getRequestSpec())
            .pathParam("petId", petId)
        .when()
            .get("/pet/{petId}")
        .then()
            .statusCode(200)
            .body(JsonSchemaValidator.matchesJsonSchema(
                    new File("src/test/resources/schemas/pet-schema.json")));
    }
}

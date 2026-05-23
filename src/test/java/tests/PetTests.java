package tests;

import base.BaseTest;
import io.restassured.module.jsv.JsonSchemaValidator;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;
import utils.ApiUtils;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class PetTests extends BaseTest {

    private long petId;
    private final String petName = "AIGravityPet";
    private final String petStatus = "available";

    @Test(priority = 1)
    public void testCreatePet() {
        Map<String, Object> body = new HashMap<>();
        body.put("name", petName);
        body.put("status", petStatus);
        body.put("photoUrls", new String[]{"http://example.com/photo"});

        Response response = given()
                .spec(ApiUtils.getRequestSpec())
                .body(body)
            .when()
                .post("/pet")
            .then()
                .statusCode(200)
                .body("name", equalTo(petName))
                .body("status", equalTo(petStatus))
                .extract().response();

        petId = response.path("id");
        System.out.println("Created Pet ID: " + petId);
    }

    @Test(priority = 2, dependsOnMethods = "testCreatePet")
    public void testGetPetById() {
        given()
                .spec(ApiUtils.getRequestSpec())
                .pathParam("petId", petId)
            .when()
                .get("/pet/{petId}")
            .then()
                .statusCode(200)
                .body("id", equalTo(petId))
                .body("name", notNullValue())
                .body("status", notNullValue())
                // JSON Schema Validation
                .body(JsonSchemaValidator.matchesJsonSchema(
                        new File("src/test/resources/schemas/pet-schema.json")));
    }

    /**
     * MCP-Style Endpoint Validation:
     * Focuses on secure and accurate tool-calling responses for AI.
     */
    @Test(priority = 3, dependsOnMethods = "testCreatePet")
    public void testMCPValidation() {
        Response response = given()
                .spec(ApiUtils.getRequestSpec())
                .pathParam("petId", petId)
            .when()
                .get("/pet/{petId}");

        // 1. Validate no sensitive data exposure (MCP Concept)
        Assert.assertTrue(ApiUtils.isSecureResponse(response), "Sensitive headers detected!");

        // 2. Validate response structure for AI tool-calling (Structured & Predictable)
        response.then()
                .body("id", instanceOf(Long.class))
                .body("name", instanceOf(String.class))
                .body("$", hasKey("status"));

        // 3. Contract testing: Required fields check
        response.then()
                .body("name", not(emptyOrNullString()))
                .body("photoUrls", not(empty()));
        
        System.out.println("MCP Endpoint Validation Passed for Pet ID: " + petId);
    }
}

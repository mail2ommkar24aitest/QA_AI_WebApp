package tests;

import base.BaseTest;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;
import utils.JsonUtils;

import static io.restassured.RestAssured.given;

/**
 * UserTests - Contains Positive and Negative test cases
 * for Login API using REST Assured
 */
public class UserTests extends BaseTest {

    // ============================
    // ✅ POSITIVE TEST CASES
    // ============================

    /**
     * Test 1: Valid Login
     */
    @Test(priority = 1, description = "Verify login with valid credentials")
    public void testValidLogin() {
        test.info("Executing valid login test");

        String requestBody = "{ \"email\": \"eve.holt@reqres.in\", \"password\": \"cityslicka\" }";

        Response response = given()
                .spec(requestSpec)
                .body(requestBody)
                .when()
                .post("/api/login");

        Assert.assertEquals(response.getStatusCode(), 200);
        Assert.assertNotNull(JsonUtils.getJsonValue(response, "token"));
    }

    /**
     * Test 2: Validate Response Time
     */
    @Test(priority = 2, description = "Validate response time is under 2 seconds")
    public void testResponseTime() {
        Response response = given()
                .spec(requestSpec)
                .body("{ \"email\": \"eve.holt@reqres.in\", \"password\": \"cityslicka\" }")
                .when()
                .post("/api/login");

        Assert.assertTrue(response.getTime() < 2000, "Response time is too high");
    }

    /**
     * Test 3: Validate Response Structure
     */
    @Test(priority = 3, description = "Validate token exists in response")
    public void testResponseStructure() {
        Response response = given()
                .spec(requestSpec)
                .body("{ \"email\": \"eve.holt@reqres.in\", \"password\": \"cityslicka\" }")
                .when()
                .post("/api/login");

        String token = JsonUtils.getJsonValue(response, "token");
        Assert.assertNotNull(token);
        Assert.assertFalse(token.isEmpty());
    }

    /**
     * Test 4: Multiple Valid Users (Data Variation)
     */
    @Test(priority = 4, description = "Validate login with another valid user")
    public void testAnotherValidUser() {
        String requestBody = "{ \"email\": \"peter@klaven\", \"password\": \"password\" }";

        Response response = given()
                .spec(requestSpec)
                .body(requestBody)
                .when()
                .post("/api/login");

        Assert.assertTrue(response.getStatusCode() == 200 || response.getStatusCode() == 400);
    }

    /**
     * Test 5: Validate Headers
     */
    @Test(priority = 5, description = "Validate Content-Type header")
    public void testResponseHeaders() {
        Response response = given()
                .spec(requestSpec)
                .body("{ \"email\": \"eve.holt@reqres.in\", \"password\": \"cityslicka\" }")
                .when()
                .post("/api/login");

        Assert.assertEquals(response.getHeader("Content-Type"), "application/json; charset=utf-8");
    }

    // ============================
    // ❌ NEGATIVE TEST CASES
    // ============================

    /**
     * Test 6: Missing Password
     */
    @Test(priority = 6, description = "Login without password should fail")
    public void testMissingPassword() {
        String requestBody = "{ \"email\": \"eve.holt@reqres.in\" }";

        Response response = given()
                .spec(requestSpec)
                .body(requestBody)
                .when()
                .post("/api/login");

        Assert.assertEquals(response.getStatusCode(), 400);
    }

    /**
     * Test 7: Missing Email
     */
    @Test(priority = 7, description = "Login without email should fail")
    public void testMissingEmail() {
        String requestBody = "{ \"password\": \"cityslicka\" }";

        Response response = given()
                .spec(requestSpec)
                .body(requestBody)
                .when()
                .post("/api/login");

        Assert.assertEquals(response.getStatusCode(), 400);
    }

    /**
     * Test 8: Empty Request Body
     */
    @Test(priority = 8, description = "Empty request body should fail")
    public void testEmptyBody() {
        Response response = given()
                .spec(requestSpec)
                .body("{}")
                .when()
                .post("/api/login");

        Assert.assertEquals(response.getStatusCode(), 400);
    }

    /**
     * Test 9: Invalid Credentials
     */
    @Test(priority = 9, description = "Invalid credentials should return error")
    public void testInvalidCredentials() {
        String requestBody = "{ \"email\": \"invalid@test.com\", \"password\": \"wrong\" }";

        Response response = given()
                .spec(requestSpec)
                .body(requestBody)
                .when()
                .post("/api/login");

        Assert.assertTrue(response.getStatusCode() == 400 || response.getStatusCode() == 401);
    }

    /**
     * Test 10: Invalid Content-Type
     */
    @Test(priority = 10, description = "Invalid content type should fail")
    public void testInvalidContentType() {
        Response response = given()
                .contentType("text/plain")
                .body("invalid data")
                .when()
                .post("/api/login");

        Assert.assertTrue(response.getStatusCode() == 400 || response.getStatusCode() == 415);
    }

    // ============================
    // 🔴 INTENTIONALLY FAILING TEST CASES
    // ============================

    /**
     * Test 11: Wrong Status Code Assertion (Intentional Fail)
     * Expects 201 Created, but login API returns 200 OK
     */
    @Test(priority = 11, description = "Intentional Fail - Expects 201 instead of 200")
    public void testWrongStatusCodeExpectation() {
        String requestBody = "{ \"email\": \"eve.holt@reqres.in\", \"password\": \"cityslicka\" }";

        Response response = given()
                .spec(requestSpec)
                .body(requestBody)
                .when()
                .post("/api/login");

        // Intentional Fail: Login returns 200, but we assert 201
        Assert.assertEquals(response.getStatusCode(), 201, "Expected 201 Created but got " + response.getStatusCode());
    }

    /**
     * Test 12: Non-Existent Field Assertion (Intentional Fail)
     * Asserts a field "sessionId" that doesn't exist in the response
     */
    @Test(priority = 12, description = "Intentional Fail - Expects non-existent field 'sessionId'")
    public void testNonExistentFieldInResponse() {
        String requestBody = "{ \"email\": \"eve.holt@reqres.in\", \"password\": \"cityslicka\" }";

        Response response = given()
                .spec(requestSpec)
                .body(requestBody)
                .when()
                .post("/api/login");

        // Intentional Fail: "sessionId" does not exist in the login response
        String sessionId = JsonUtils.getJsonValue(response, "sessionId");
        Assert.assertNotNull(sessionId, "Expected 'sessionId' field in response but it was null");
    }

    /**
     * Test 13: Wrong Content-Type Assertion (Intentional Fail)
     * Expects "application/xml" but actual is "application/json"
     */
    @Test(priority = 13, description = "Intentional Fail - Expects wrong Content-Type header")
    public void testWrongContentTypeExpectation() {
        String requestBody = "{ \"email\": \"eve.holt@reqres.in\", \"password\": \"cityslicka\" }";

        Response response = given()
                .spec(requestSpec)
                .body(requestBody)
                .when()
                .post("/api/login");

        // Intentional Fail: Actual Content-Type is "application/json; charset=utf-8"
        Assert.assertEquals(response.getHeader("Content-Type"), "application/xml",
                "Expected application/xml but got " + response.getHeader("Content-Type"));
    }
}

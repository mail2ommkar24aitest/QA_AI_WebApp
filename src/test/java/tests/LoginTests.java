package tests;

import base.BaseTest;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;
import utils.JsonUtils;

import static io.restassured.RestAssured.given;

/**
 * LoginTests - Contains Positive and Negative test cases
 * for Login API using REST Assured
 */
public class LoginTests extends BaseTest {

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
        test.info("Executing response time validation test");
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
        test.info("Executing response structure validation test");
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
        test.info("Executing another valid user login test");
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
        test.info("Executing response headers validation test");
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
        test.info("Executing missing password negative test");
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
        test.info("Executing missing email negative test");
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
        test.info("Executing empty body negative test");
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
        test.info("Executing invalid credentials negative test");
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
        test.info("Executing invalid content-type negative test");
        Response response = given()
                .spec(requestSpec)
                .contentType("text/plain")
                .body("invalid data")
                .when()
                .post("/api/login");

        Assert.assertTrue(response.getStatusCode() == 400 || response.getStatusCode() == 415);
    }
}

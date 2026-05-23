package tests;

import base.BaseTest;
import org.testng.annotations.Test;
import utils.ApiUtils;
import java.util.HashMap;
import java.util.Map;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class CreatePetTest extends BaseTest {

    @Test
    public void testCreatePet() {
        Map<String, Object> body = new HashMap<>();
        body.put("name", "AIGravityPet");
        body.put("status", "available");
        body.put("photoUrls", new String[]{"http://example.com/photo"});

        given()
            .spec(ApiUtils.getRequestSpec())
            .body(body)
        .when()
            .post("/pet")
        .then()
            .statusCode(200)
            .body("name", equalTo("AIGravityPet"))
            .body("status", equalTo("available"));
    }
}

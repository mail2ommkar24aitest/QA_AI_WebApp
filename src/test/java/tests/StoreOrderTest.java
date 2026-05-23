package tests;

import base.BaseTest;
import org.testng.annotations.Test;
import utils.ApiUtils;
import java.util.HashMap;
import java.util.Map;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class StoreOrderTest extends BaseTest {

    @Test
    public void testPlaceOrder() {
        Map<String, Object> body = new HashMap<>();
        body.put("petId", 12345);
        body.put("quantity", 1);
        body.put("shipDate", "2024-05-10T10:00:00.000Z");
        body.put("status", "placed");
        body.put("complete", true);

        given()
            .spec(ApiUtils.getRequestSpec())
            .body(body)
        .when()
            .post("/store/order")
        .then()
            .statusCode(200)
            .body("status", equalTo("placed"))
            .body("complete", equalTo(true));
    }
}

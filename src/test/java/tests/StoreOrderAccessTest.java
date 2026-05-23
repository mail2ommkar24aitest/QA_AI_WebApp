package tests;

import base.BaseTest;
import org.testng.annotations.Test;
import utils.ApiUtils;

import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class StoreOrderAccessTest extends BaseTest {

    private final long ORDER_ID_TO_CREATE = 55667788L;
    private final long NON_EXISTING_ORDER_ID = 999999999L;

    @Test(priority = 1)
    public void testPlaceOrder_Positive() {
        Map<String, Object> body = new HashMap<>();
        body.put("id", ORDER_ID_TO_CREATE);
        body.put("petId", 1247);
        body.put("quantity", 2);
        body.put("shipDate", "2024-05-15T10:00:00.000Z");
        body.put("status", "placed");
        body.put("complete", true);

        given()
            .spec(ApiUtils.getRequestSpec())
            .body(body)
        .when()
            .post("/store/order")
        .then()
            .statusCode(200)
            .body("status", equalTo("placed"));
    }

    @Test(priority = 2)
    public void testFindOrderById_Positive() {
        given()
            .spec(ApiUtils.getRequestSpec())
            .pathParam("orderId", ORDER_ID_TO_CREATE)
        .when()
            .get("/store/order/{orderId}")
        .then()
            .statusCode(200)
            .body("petId", equalTo(1247))
            .body("status", equalTo("placed"));
    }

    @Test(priority = 3)
    public void testFindOrderById_Negative_NotFound() {
        given()
            .spec(ApiUtils.getRequestSpec())
            .pathParam("orderId", NON_EXISTING_ORDER_ID)
        .when()
            .get("/store/order/{orderId}")
        .then()
            .statusCode(404)
            .body("message", equalTo("Order not found"));
    }

    @Test(priority = 4)
    public void testDeleteOrderById_Positive() {
        given()
            .spec(ApiUtils.getRequestSpec())
            .pathParam("orderId", ORDER_ID_TO_CREATE)
        .when()
            .delete("/store/order/{orderId}")
        .then()
            .statusCode(200)
            .body("message", equalTo(String.valueOf(ORDER_ID_TO_CREATE)));
    }

    @Test(priority = 5)
    public void testDeleteOrderById_Negative_NotFound() {
        given()
            .spec(ApiUtils.getRequestSpec())
            .pathParam("orderId", NON_EXISTING_ORDER_ID)
        .when()
            .delete("/store/order/{orderId}")
        .then()
            .statusCode(404)
            .body("message", equalTo("Order Not Found"));
    }

    @Test(priority = 6)
    public void testPlaceOrder_Negative_InvalidBody() {
        given()
            .spec(ApiUtils.getRequestSpec())
            .body("{ \"invalidJson\": ") // Malformed JSON
        .when()
            .post("/store/order")
        .then()
            .statusCode(400); // Bad Request
    }
}

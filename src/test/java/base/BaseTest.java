package base;

import io.restassured.RestAssured;
import org.testng.annotations.BeforeClass;

public class BaseTest {
    
    @BeforeClass
    public void setup() {
        // Base URI for Swagger Petstore
        RestAssured.baseURI = "https://petstore.swagger.io/v2";
    }
}

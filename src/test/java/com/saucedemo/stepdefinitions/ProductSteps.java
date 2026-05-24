package com.saucedemo.stepdefinitions;

import com.saucedemo.base.BaseTest;
import com.saucedemo.pages.LoginPage;
import com.saucedemo.pages.InventoryPage;
import com.saucedemo.utils.CsvUtils;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.testng.Assert;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class ProductSteps extends BaseTest {

    private InventoryPage inventoryPage;
    private String selectedProductName;

    @Given("I log in to the application")
    public void iLogInToTheApplication() {
        LoginPage loginPage = new LoginPage(getDriver());
        // Retrieve valid credentials from loginData.csv
        Map<String, String> row = CsvUtils.getRowByFilter("loginData.csv", "username", "standard_user");
        Assert.assertNotNull(row, "FAILED: Row not found in CSV for standard_user");
        
        loginPage.login(row.get("username"), row.get("password"));
        inventoryPage = new InventoryPage(getDriver());
        Assert.assertTrue(inventoryPage.isInventoryPageDisplayed(), "FAILED: Log in failed.");
    }

    @Then("I should see {int} inventory products displayed on the screen")
    public void iShouldSeeInventoryProductsDisplayedOnTheScreen(int expectedCount) {
        List<String> names = inventoryPage.getProductNames();
        System.out.println("Discovered " + names.size() + " product names.");
        Assert.assertEquals(names.size(), expectedCount, 
                "FAILED: Product count mismatch. Expected " + expectedCount + " but got " + names.size());
    }

    @When("I read product data for row index {int} from CSV")
    public void iReadProductDataForRowIndexFromCSV(int rowIndex) {
        List<Map<String, String>> rows = CsvUtils.readCsvData("productData.csv");
        Assert.assertTrue(rowIndex < rows.size(), "FAILED: CSV row index " + rowIndex + " out of bounds.");
        
        this.selectedProductName = rows.get(rowIndex).get("productName");
        System.out.println("Loaded Product Name from CSV: [" + selectedProductName + "]");
    }

    @When("I add the product to the cart")
    public void iAddTheProductToTheCart() {
        System.out.println("Adding product to cart: " + selectedProductName);
        inventoryPage.addItemToCart(selectedProductName);
    }

    @Then("the shopping cart badge should display count {int}")
    public void theShoppingCartBadgeShouldDisplayCount(int expectedCount) {
        int actualCount = inventoryPage.getCartCount();
        System.out.println("Cart Badge Count: " + actualCount);
        Assert.assertEquals(actualCount, expectedCount, 
                "FAILED: Cart badge mismatch. Expected " + expectedCount + " but got " + actualCount);
    }

    @When("I remove the product from the cart")
    public void iRemoveTheProductFromTheCart() {
        System.out.println("Removing product from cart: " + selectedProductName);
        inventoryPage.removeItemFromCart(selectedProductName);
    }

    @Then("the shopping cart badge should not be displayed")
    public void theShoppingCartBadgeShouldNotBeDisplayed() {
        int actualCount = inventoryPage.getCartCount();
        System.out.println("Cart Badge Count: " + actualCount);
        Assert.assertEquals(actualCount, 0, 
                "FAILED: Cart badge was displayed but expected hidden.");
    }

    @When("I sort products by {string}")
    public void iSortProductsBy(String sortOption) {
        System.out.println("Sorting products by: " + sortOption);
        inventoryPage.selectSortOption(sortOption);
    }

    @Then("the products should be sorted alphabetically in ascending order")
    public void theProductsShouldBeSortedAlphabeticallyInAscendingOrder() {
        List<String> names = inventoryPage.getProductNames();
        List<String> sortedNames = new ArrayList<>(names);
        Collections.sort(sortedNames);
        System.out.println("Checking names sort A to Z: " + names);
        Assert.assertEquals(names, sortedNames, "FAILED: Products not sorted alphabetically A to Z.");
    }

    @Then("the products should be sorted alphabetically in descending order")
    public void theProductsShouldBeSortedAlphabeticallyInDescendingOrder() {
        List<String> names = inventoryPage.getProductNames();
        List<String> sortedNames = new ArrayList<>(names);
        Collections.sort(sortedNames, Collections.reverseOrder());
        System.out.println("Checking names sort Z to A: " + names);
        Assert.assertEquals(names, sortedNames, "FAILED: Products not sorted alphabetically Z to A.");
    }

    @Then("the products should be sorted by price in ascending order")
    public void theProductsShouldBeSortedByPriceInAscendingOrder() {
        List<Double> prices = inventoryPage.getProductPrices();
        List<Double> sortedPrices = new ArrayList<>(prices);
        Collections.sort(sortedPrices);
        System.out.println("Checking prices sort Low to High: " + prices);
        Assert.assertEquals(prices, sortedPrices, "FAILED: Products not sorted by price low to high.");
    }

    @Then("the products should be sorted by price in descending order")
    public void theProductsShouldBeSortedByPriceInDescendingOrder() {
        List<Double> prices = inventoryPage.getProductPrices();
        List<Double> sortedPrices = new ArrayList<>(prices);
        Collections.sort(sortedPrices, Collections.reverseOrder());
        System.out.println("Checking prices sort High to Low: " + prices);
        Assert.assertEquals(prices, sortedPrices, "FAILED: Products not sorted by price high to low.");
    }
}

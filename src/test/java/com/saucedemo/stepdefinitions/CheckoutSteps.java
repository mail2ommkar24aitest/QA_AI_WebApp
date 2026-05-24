package com.saucedemo.stepdefinitions;

import com.saucedemo.base.BaseTest;
import com.saucedemo.pages.CartPage;
import com.saucedemo.pages.CheckoutCompletePage;
import com.saucedemo.pages.CheckoutStepOnePage;
import com.saucedemo.pages.CheckoutStepTwoPage;
import com.saucedemo.pages.InventoryPage;
import com.saucedemo.utils.CsvUtils;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.testng.Assert;

import java.util.List;
import java.util.Map;

public class CheckoutSteps extends BaseTest {

    private InventoryPage inventoryPage;
    private CartPage cartPage;
    private CheckoutStepOnePage checkoutStepOnePage;
    private CheckoutStepTwoPage checkoutStepTwoPage;
    private CheckoutCompletePage checkoutCompletePage;

    private String firstName;
    private String lastName;
    private String postalCode;

    /** Pauses execution briefly so the user can visually follow the test. */
    private void visualPause() {
        try { Thread.sleep(2500); } catch (InterruptedException ignored) {}
    }

    @Given("I add {string} to the cart and navigate to checkout")
    public void iAddProductToCartAndNavigateToCheckout(String productName) {
        inventoryPage = new InventoryPage(getDriver());
        inventoryPage.addItemToCart(productName);
        visualPause();
        inventoryPage.clickCart();
        visualPause();
        
        cartPage = new CartPage(getDriver());
        Assert.assertTrue(cartPage.isCartPageDisplayed(), "FAILED: Did not load Cart Page.");
        visualPause();
        cartPage.clickCheckout();
        
        checkoutStepOnePage = new CheckoutStepOnePage(getDriver());
        Assert.assertTrue(checkoutStepOnePage.isPageDisplayed(), "FAILED: Did not load Checkout Step One Page.");
        visualPause();
    }

    @When("I read checkout data for row index {int} from CSV")
    public void iReadCheckoutDataForRowIndexFromCSV(int rowIndex) {
        List<Map<String, String>> rows = CsvUtils.readCsvData("checkoutData.csv");
        Assert.assertTrue(rowIndex < rows.size(), "FAILED: CSV checkout row index " + rowIndex + " out of bounds.");
        
        Map<String, String> row = rows.get(rowIndex);
        this.firstName = row.get("firstName") == null ? "" : row.get("firstName");
        this.lastName = row.get("lastName") == null ? "" : row.get("lastName");
        this.postalCode = row.get("postalCode") == null ? "" : row.get("postalCode");
        
        System.out.println("Loaded Checkout Form Data: [First: " + firstName + " | Last: " + lastName + " | Zip: " + postalCode + "]");
        visualPause();
    }

    @When("I fill step one checkout form and continue")
    public void iFillStepOneCheckoutFormAndContinue() {
        checkoutStepOnePage.fillInformation(firstName, lastName, postalCode);
        visualPause();
    }

    @Then("I should be navigated to step two checkout overview page")
    public void iShouldBeNavigatedToStepTwoCheckoutOverviewPage() {
        checkoutStepTwoPage = new CheckoutStepTwoPage(getDriver());
        Assert.assertTrue(checkoutStepTwoPage.isPageDisplayed(), "FAILED: Did not navigate to Checkout Overview page.");
        visualPause();
    }

    @Then("I click finish")
    public void iClickFinish() {
        checkoutStepTwoPage.clickFinish();
        visualPause();
    }

    @Then("I should be navigated to the order completion landing page")
    public void iShouldBeNavigatedToTheOrderCompletionLandingPage() {
        checkoutCompletePage = new CheckoutCompletePage(getDriver());
        Assert.assertTrue(checkoutCompletePage.isPageDisplayed(), "FAILED: Did not navigate to Order Completion page.");
        visualPause();
    }

    @Then("the order confirmation success message should be displayed")
    public void theOrderConfirmationSuccessMessageShouldBeDisplayed() {
        String msg = checkoutCompletePage.getConfirmationHeader();
        System.out.println("Actual Confirmation Header: " + msg);
        Assert.assertTrue(msg.equalsIgnoreCase("Thank you for your order!"), 
                "FAILED: Success message mismatch. Got: " + msg);
        Assert.assertTrue(checkoutCompletePage.isPonyExpressImageDisplayed(), 
                "FAILED: Pony Express visual asset not visible on completion page.");
        visualPause();
    }

    @Then("I should see the checkout first name required error message")
    public void iShouldSeeTheCheckoutFirstNameRequiredErrorMessage() {
        String actualError = checkoutStepOnePage.getErrorMessage();
        System.out.println("Actual Checkout Error: " + actualError);
        Assert.assertTrue(actualError.contains("First Name is required"), 
                "FAILED: Expected First Name is required error, but got: " + actualError);
        visualPause();
    }

    @Then("I should see the checkout last name required error message")
    public void iShouldSeeTheCheckoutLastNameRequiredErrorMessage() {
        String actualError = checkoutStepOnePage.getErrorMessage();
        System.out.println("Actual Checkout Error: " + actualError);
        Assert.assertTrue(actualError.contains("Last Name is required"), 
                "FAILED: Expected Last Name is required error, but got: " + actualError);
        visualPause();
    }

    @Then("I should see the checkout postal code required error message")
    public void iShouldSeeTheCheckoutPostalCodeRequiredErrorMessage() {
        String actualError = checkoutStepOnePage.getErrorMessage();
        System.out.println("Actual Checkout Error: " + actualError);
        Assert.assertTrue(actualError.contains("Postal Code is required"), 
                "FAILED: Expected Postal Code is required error, but got: " + actualError);
        visualPause();
    }
}

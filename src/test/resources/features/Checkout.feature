@checkout
Feature: SauceDemo Checkout and Form Validations

  @smoke @sanity @regression
  Scenario: Successful Checkout Path
    Given I log in to the application
    And I add "Sauce Labs Backpack" to the cart and navigate to checkout
    When I read checkout data for row index 0 from CSV
    And I fill step one checkout form and continue
    Then I should be navigated to step two checkout overview page
    And I click finish
    Then I should be navigated to the order completion landing page
    And the order confirmation success message should be displayed

  @regression
  Scenario: Checkout Validation Error Empty First Name
    Given I log in to the application
    And I add "Sauce Labs Backpack" to the cart and navigate to checkout
    When I read checkout data for row index 2 from CSV
    And I fill step one checkout form and continue
    Then I should see the checkout first name required error message

  @regression
  Scenario: Checkout Validation Error Empty Last Name
    Given I log in to the application
    And I add "Sauce Labs Backpack" to the cart and navigate to checkout
    When I read checkout data for row index 3 from CSV
    And I fill step one checkout form and continue
    Then I should see the checkout last name required error message

  @regression
  Scenario: Checkout Validation Error Empty Postal Code
    Given I log in to the application
    And I add "Sauce Labs Backpack" to the cart and navigate to checkout
    When I read checkout data for row index 4 from CSV
    And I fill step one checkout form and continue
    Then I should see the checkout postal code required error message

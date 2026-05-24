@products
Feature: SauceDemo Product Listing Functionality

  @smoke @sanity @regression
  Scenario: Product Dashboard Item Visibility
    Given I log in to the application
    Then I should see six inventory products displayed on the screen

  @smoke @regression
  Scenario: Cart Operations Dynamic Badge Count
    Given I log in to the application
    When I read product data for row index 0 from CSV
    And I add the product to the cart
    Then the shopping cart badge should display count 1
    And I remove the product from the cart
    Then the shopping cart badge should not be displayed

  @regression
  Scenario: Sort Products Alphabetically A to Z
    Given I log in to the application
    When I sort products by "Name (A to Z)"
    Then the products should be sorted alphabetically in ascending order

  @regression
  Scenario: Sort Products Alphabetically Z to A
    Given I log in to the application
    When I sort products by "Name (Z to A)"
    Then the products should be sorted alphabetically in descending order

  @regression
  Scenario: Sort Products Price Low to High
    Given I log in to the application
    When I sort products by "Price (low to high)"
    Then the products should be sorted by price in ascending order

  @regression
  Scenario: Sort Products Price High to Low
    Given I log in to the application
    When I sort products by "Price (high to low)"
    Then the products should be sorted by price in descending order

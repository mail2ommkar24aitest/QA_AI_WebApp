# Running Petstore API Tests

This project uses **Maven**, **RestAssured**, and **TestNG**.

## Prerequisites
- **Java 17+** (Detected: Java 22)
- **Maven** installed and added to PATH.

## How to Run

### Option 1: Command Line (Maven)
Open your terminal in the project root and run:
```bash
mvn test
```
This will execute the suite defined in `testng.xml`.

### Option 2: Run via IDE (IntelliJ / Eclipse)
1. Right-click on `testng.xml` in the project root.
2. Select **Run '.../testng.xml'**.
*Alternatively, open `src/test/java/tests/PetTests.java` and click the green 'Play' button next to the class name.*

### Option 3: Clean and Test
To ensure a fresh build before testing:
```bash
mvn clean test
```

## Test Reports
After running the tests, Maven generates reports in:
`target/surefire-reports/index.html`

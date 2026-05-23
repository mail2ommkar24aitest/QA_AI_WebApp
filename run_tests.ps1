# This script sets up a local Maven instance and runs the tests.
# It "fixes" the 'mvn not found' error by providing a portable version.

$MAVEN_VERSION = "3.9.5"
$MAVEN_DIR = "$PSScriptRoot\.maven"
$MAVEN_ZIP = "$PSScriptRoot\maven.zip"
$MAVEN_URL = "https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip"

if (-not (Test-Path "$MAVEN_DIR\apache-maven-$MAVEN_VERSION")) {
    Write-Host "Maven not found. Downloading portable Maven $MAVEN_VERSION..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $MAVEN_URL -OutFile $MAVEN_ZIP
    
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $MAVEN_ZIP -DestinationPath $MAVEN_DIR
    Remove-Item $MAVEN_ZIP
}

$MVN_BIN = "$MAVEN_DIR\apache-maven-$MAVEN_VERSION\bin\mvn.cmd"

Write-Host "Running tests using local Maven..." -ForegroundColor Green
& $MVN_BIN test

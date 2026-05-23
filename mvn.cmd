@echo off
set "REAL_MVN=%~dp0.maven\apache-maven-3.9.5\bin\mvn.cmd"
if exist "%REAL_MVN%" (
    "%REAL_MVN%" %*
) else (
    echo Error: Local Maven not found at %REAL_MVN%
    exit /b 1
)

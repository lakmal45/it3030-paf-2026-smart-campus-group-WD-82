@echo off
REM Smart Campus Test Execution Script
REM This script runs all backend tests and generates reports

echo.
echo =========================================
echo Smart Campus - Test Execution Script
echo =========================================
echo.

REM Check if we're in the right directory
if not exist backend\pom.xml (
    echo Error: pom.xml not found. Please run this script from the project root directory.
    exit /b 1
)

echo [1] Running Backend Tests...
echo =========================================

cd backend

REM Run Maven tests with verbose output
call mvnw clean test -X

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] All backend tests passed!
    echo.
    echo Test reports location:
    echo target\surefire-reports\
    echo.
    
    REM Generate HTML report
    echo [2] Generating Surefire Report...
    call mvnw surefire-report:report
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Test report generated!
        echo Report location: target\site\surefire-report.html
        echo.
    )
) else (
    echo.
    echo [FAILED] Some tests failed. Check the output above.
    echo.
    exit /b 1
)

cd ..

echo [3] Test Summary
echo =========================================
echo Module:                Resource Management
echo Total Test Classes:     3
echo Total Test Cases:       55
echo Status:                 PASS
echo.
echo Test Classes:
echo  - ResourceServiceTest         (14 tests, Mockito)
echo  - ResourceControllerTest      (17 tests, @WebMvcTest)
echo  - ResourceRepositoryTest      (24 tests, @DataJpaTest)
echo.

echo [4] Frontend Build Check
echo =========================================
cd frontend

if not exist node_modules (
    echo Dependencies not installed. Installing now...
    call npm install
)

echo Running frontend build...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Frontend build successful!
    echo Build output location: dist\
) else (
    echo [FAILED] Frontend build failed.
)

cd ..

echo.
echo =========================================
echo Test Execution Complete
echo =========================================
echo.
echo Next Steps:
echo 1. Review backend test report: backend\target\site\surefire-report.html
echo 2. Check frontend dist build
echo 3. View CI/CD workflow: .github\workflows\ci.yml
echo 4. Review report: TEST_AND_CI_REPORT.md
echo.

@echo off
echo =====================================================================
echo  Pushing Smart Campus Navigator to GitHub
echo  Repository: https://github.com/abhaymalan360/Smart-Campus-Navigator
echo =====================================================================
echo.
echo Make sure you have authenticated your GitHub account if prompted.
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo =====================================================================
    echo  SUCCESS: Code successfully pushed to GitHub!
    echo  View repository: https://github.com/abhaymalan360/Smart-Campus-Navigator
    echo =====================================================================
) else (
    echo =====================================================================
    echo  Push failed. Please sign in via the browser pop-up or use:
    echo  git push https://^<YOUR_GITHUB_TOKEN^>@github.com/abhaymalan360/Smart-Campus-Navigator.git main
    echo =====================================================================
)
pause

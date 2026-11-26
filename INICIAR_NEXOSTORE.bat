@echo off
setlocal
cd /d "%~dp0"
title NexoStore Gaming - Full Stack
echo ==========================================
echo       NEXOSTORE GAMING - FULL STACK
echo ==========================================
where mvn >nul 2>nul
if errorlevel 1 (
  echo ERROR: Maven no esta disponible en PATH.
  echo Abre backend/pom.xml en IntelliJ IDEA y ejecuta spring-boot:run desde Maven.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js no esta disponible en PATH.
  pause
  exit /b 1
)
if not exist node_modules\vite (
  echo Instalando dependencias de React...
  call npm ci
  if errorlevel 1 (echo ERROR instalando dependencias. & pause & exit /b 1)
)
echo Iniciando API Spring Boot en puerto 8080...
start "NexoStore API - Spring Boot" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"
timeout /t 8 /nobreak >nul
echo Iniciando frontend React en puerto 5173...
start "NexoStore Frontend - React" cmd /k "cd /d %~dp0 && npm run dev"
echo.
echo API:      http://localhost:8080/api/health
echo Swagger:  http://localhost:8080/swagger-ui/index.html
echo Frontend: http://localhost:5173
echo H2:       http://localhost:8080/h2-console (requiere ADMIN)
pause

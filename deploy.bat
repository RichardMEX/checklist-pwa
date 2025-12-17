@echo off
echo 🔄 Actualizando Sistema de Checklists...
echo.

cd /d "D:\Apps test\checklist-pwa"

echo 📦 Instalando dependencias...
call npm install

echo 🏗️ Creando build de producción...
cd frontend
call npm run build
cd ..

echo 🔄 Reiniciando aplicación...
call pm2 restart checklist-app

echo ✅ Actualización completada!
echo.
echo 📱 URL de acceso: http://192.168.0.7:5000
echo 💻 URL local: http://localhost:5000
echo.

REM Verificar si existe el proceso antes de reiniciar
pm2 list | findstr checklist-app
IF %ERRORLEVEL% NEQ 0 (
    echo ⚠ Proceso no encontrado. Iniciando...
    pm2 start backend/server.js --name "checklist-app"
) ELSE (
    echo 🔄 Reiniciando aplicación...
    pm2 restart checklist-app
)

pause
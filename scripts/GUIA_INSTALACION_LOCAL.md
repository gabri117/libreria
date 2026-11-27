# Guía de Instalación Local en PC Windows (Opción 1 — Modo Escritorio)

Esta guía prepara la PC de la librería para ejecutar el sistema **sin Docker**, con consumo mínimo de RAM, ventana tipo aplicación de escritorio y respaldos automáticos diarios.

---

## 1. Requisitos (una sola vez en la PC)
1. **Java 21 (Eclipse Temurin JRE/JDK 21)** instalado y en el `PATH`.
2. **PostgreSQL 15 o superior** instalado como servicio de Windows (asegúrate de incluir `pg_dump` en el `PATH`).
3. **Node.js 20 LTS** (solo necesario en la PC donde se compila el paquete).

---

## 2. Crear Base de Datos y Usuario en PostgreSQL
Ejecuta en `psql` o pgAdmin:
```sql
CREATE USER user_libreria WITH PASSWORD 'TU_PASSWORD_SEGURO';
CREATE DATABASE bd_libreria OWNER user_libreria;
```
> Al iniciar por primera vez con el perfil `prod`, **Flyway** ejecutará automáticamente `V1__init.sql` (tablas, roles y usuario administrador inicial). Si la base de datos ya existía, Flyway hará *baseline* sin borrar datos.

---

## 3. Configurar `.env` de Producción
1. Copia `.env.example` a `.env` en la raíz del proyecto.
2. Genera una clave `JWT_SECRET` Base64 segura en PowerShell:
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
3. Completa `.env` con `SPRING_PROFILES_ACTIVE=prod`, `DB_URL`, `DB_USER`, `DB_PASSWORD` y el `JWT_SECRET` generado.
4. **Importante**: al entrar por primera vez con el usuario inicial `administradorLB`, cambia su contraseña desde el módulo **Usuarios**.

---

## 4. Empaquetar el Sistema (Frontend embebido + Backend JAR)
```powershell
.\scripts\empaquetar_produccion.ps1
```
Esto compila React, lo embebe dentro de Spring Boot y genera `target\libreria-0.0.1-SNAPSHOT.jar`.

---

## 5. Crear Acceso Directo "App de Escritorio"
```powershell
.\scripts\crear_acceso_directo.ps1
```
Creará el ícono **POS Librería María y José** en el Escritorio. Al hacer doble clic:
- Inicia el backend en segundo plano si aún no está corriendo.
- Abre Microsoft Edge (o Chrome) en modo ventana limpia (`--app=http://localhost:8080`), sin pestañas ni barra de direcciones.

*(Opcional)* Si prefieres que el backend arranque automáticamente al encender Windows incluso antes de hacer clic en el ícono, puedes registrarlo como servicio de Windows usando **WinSW** o **NSSM** apuntando a:
`java -jar C:\ruta\libreria\target\libreria-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`

---

## 6. Programar Backups Diarios Automáticos
1. Prueba el script manualmente (puedes apuntar `-BackupDir` a una carpeta sincronizada con **Google Drive** o **OneDrive**):
   ```powershell
   .\scripts\backup_bd.ps1 -BackupDir "C:\Users\TuUsuario\Google Drive\Backups_Libreria"
   ```
2. Abre el **Programador de Tareas de Windows** -> *Crear tarea básica* -> Diario (ej. 8:00 PM) -> *Iniciar un programa*:
   - **Programa**: `powershell.exe`
   - **Argumentos**: `-NoProfile -ExecutionPolicy Bypass -File "C:\ruta\libreria\scripts\backup_bd.ps1" -BackupDir "C:\ruta\Backups_Libreria"`

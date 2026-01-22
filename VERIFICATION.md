# Guía de Verificación de Optimizaciones

Para confirmar que las mejoras de performance y almacenamiento funcionan correctamente, sigue estos pasos:

## 1. Preparación Previa

Antes de probar la aplicación, debes configurar Supabase:

### A. Crear la Vista SQL (Goleadores)
1. Ve al panel de **Supabase** > **SQL Editor**.
2. Copia el contenido del archivo `db_optimization.sql` incluido en este cambio.
3. Ejecuta el script. Deberías ver un mensaje de éxito (`Success. No rows returned`).

### B. Crear el Bucket de Imágenes
1. Ve al panel de **Supabase** > **Storage**.
2. Crea un nuevo bucket llamado `images`.
3. Asegúrate de marcarlo como **"Public bucket"**.
4. (Opcional) Configura políticas (Policies) para permitir subidas (INSERT) a cualquier usuario (para propósitos de Demo) o solo autenticados.

---

## 2. Verificar Optimización de Goleadores

Esta mejora reduce la carga de datos al calcular los goleadores en el servidor en lugar del navegador.

**Cómo probar:**
1. Inicia la aplicación (`npm run dev`).
2. Abre las herramientas de desarrollo del navegador (**F12** o **Click derecho > Inspeccionar**) y ve a la pestaña **Network (Red)**.
3. Recarga la página.
4. Filtra por "Fetch/XHR".
5. Deberías ver una petición a `view_top_scorers` en lugar de una petición masiva a `match_events` que traía todos los goles históricos.
6. La lista de goleadores en el "Home" debe aparecer correctamente ordenada.

---

## 3. Verificar Subida de Imágenes

Ahora las imágenes se guardan en el servidor (Storage) y no como texto pesado en la base de datos.

**Cómo probar:**
1. Inicia sesión como **Admin** o **Operador**.
2. Ve a **Equipos** o edita un **Jugador**.
3. Sube una nueva foto.
4. **Verificación Visual:** La imagen debe aparecer inmediatamente en el formulario.
5. **Verificación Técnica:**
   - Si inspeccionas la imagen (Click derecho > Abrir imagen en nueva pestaña), la URL debe comenzar con `https://[tu-proyecto].supabase.co/storage/v1/object/public/images/...`.
   - Antes, esto era una cadena inmensa que empezaba con `data:image/jpeg;base64...`.

---

## Solución de Problemas

- **Error "Permission denied" al subir imágenes:** Verifica que el bucket `images` sea **Público** y tenga una política de RLS que permita `INSERT` a `public` (o a usuarios autenticados si ya implementaste Auth).
- **Error "Relation does not exist" en goleadores:** Asegúrate de haber ejecutado el script SQL del paso 1.A.

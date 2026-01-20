---
description: Publicar cambios a producción (Definitive Flow)
---

# Flujo Definitivo de Publicación

Como instruido por el usuario, este es el único comando para publicar cambios:

```bash
npm run build && git add -A && git commit -m "publish" && git push
```

## Reglas Críticas

- **NO** usar Netlify manual / drag & drop.
- **NO** trackear `dist/`.
- **NO** cambiar el build command.
- **NO** tocar redirects.

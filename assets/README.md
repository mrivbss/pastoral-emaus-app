# Fuentes del icono Android

Estos archivos derivan exclusivamente del logo incrustado en `legacy/v1.html` y conservado byte a byte en `src/assets/logo.png`.

- `icon-only.png`: fuente cuadrada para launchers Android anteriores a los adaptive icons.
- `icon-foreground.png`: capa frontal para adaptive icons.
- `icon-background.png`: fondo blanco, igual al fondo del logo oficial.

El payload legacy declara `image/png`, aunque internamente es un JPEG válido de 1536×858. Para producir PNG reales se tomó su recorte central de 858×858 —que contiene el emblema completo—, se escaló proporcionalmente a 942×942 y se centró en un lienzo de 1024×1024. El margen de 41 px por lado evita que las máscaras circular, cuadrada o redondeada recorten el anillo y los textos.

Regeneración Android completa:

```bash
npm run android:icons
npx cap sync android
```

El script valida primero el SHA-256 contra el Base64 legacy, genera las fuentes, ejecuta `@capacitor/assets` y asegura que las capas adaptativas usen las resoluciones Android de 108 dp.

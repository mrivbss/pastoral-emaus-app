# Preparación para importar respaldos V1

La importación todavía no está expuesta en la interfaz. `src/types/legacy.ts` documenta el contrato del respaldo antiguo y `legacy/v1.html` conserva la implementación original.

Cuando se implemente, el importador debe ejecutarse como una operación administrativa explícita y transformar:

- cada `persona` en una fila de `integrantes`;
- cada clave `persona.pagos["AAAA-MM"]` en una fila independiente de `pagos`;
- cada elemento de `donaciones` en una fila de `donaciones`.

Debe validar RUT, resolver duplicados y usar la restricción única `(integrante_id, anio, mes)`; nunca debe escribir el JSON legacy dentro de una fila de integrante.

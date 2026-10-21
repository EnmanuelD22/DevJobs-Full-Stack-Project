# DevJobs

DevJobs es un proyecto de muestra de una plataforma de búsqueda de empleo para personas del sector tecnológico. Presenta una experiencia sencilla para descubrir oportunidades, acotar resultados y consultar la información de cada vacante.

## Objetivo

El proyecto reúne en un solo lugar oportunidades de ejemplo para distintos perfiles y niveles de experiencia. Está pensado para quienes buscan empleo y quieren explorar vacantes por puesto, empresa, habilidades, ubicación, tipo de contrato o experiencia.

## Qué puedes hacer

- Explorar la página de inicio y acceder a la búsqueda de empleos.
- Buscar vacantes por palabras relacionadas con el puesto, la empresa o las habilidades.
- Filtrar los resultados por tecnología, ubicación, tipo de contrato y nivel de experiencia.
- Recorrer los resultados paginados y abrir la ficha de una vacante.
- Revisar responsabilidades, requisitos, tecnologías y una presentación de la empresa.
- Marcar una vacante como seleccionada para postularse durante la sesión de navegación.

Las vacantes incluidas son contenido de demostración. Las acciones de inicio de sesión, publicación de empleos y postulación no envían información a un servicio ni crean una cuenta.

## Contenido

- **Inicio:** presenta DevJobs y permite pasar a la búsqueda.
- **Empleos:** reúne las vacantes y las opciones para buscar y filtrar.
- **Detalle del empleo:** muestra la información ampliada de una vacante seleccionada.
- **Vacantes de ejemplo:** ofrecen perfiles variados de tecnología, diseño y datos, con distintas ubicaciones y niveles de experiencia.

## Cómo verlo

No se necesita instalar dependencias ni compilar el proyecto. Como la búsqueda carga las vacantes desde archivos locales del sitio, ábrelo con un servidor web local en lugar de abrir el HTML directamente como archivo.

### Opción: Visual Studio Code

1. Abre la carpeta `00-html-css` en Visual Studio Code.
2. Inicia un servidor local con una extensión como **Live Server**.
3. Abre la dirección local que muestra la extensión y selecciona la página de inicio.

### Opción: Python

Desde una terminal, entra en la carpeta `00-html-css` y ejecuta:

```bash
python -m http.server 8000
```

Luego visita [http://localhost:8000](http://localhost:8000) en el navegador.

## Recorrido recomendado

1. Entra en **Empleos** desde la navegación principal.
2. Escribe una búsqueda o combina los filtros disponibles.
3. Revisa las vacantes y cambia de página si hay más resultados.
4. Abre **Ver detalles** para conocer los requisitos y responsabilidades.

## Alcance

DevJobs es una demostración de experiencia de búsqueda y exploración de vacantes. No ofrece empleos reales, no incluye cuentas de usuario y no procesa postulaciones. La información y las funciones de publicación, inicio de sesión y postulación requerirían servicios adicionales para operar como una plataforma real.

## Licencia

Este repositorio no especifica una licencia de uso. Consulta con la persona responsable del proyecto antes de reutilizar o distribuir sus contenidos.

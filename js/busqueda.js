import { getJobs } from "./jobs-data.js";

// 1. Referencias a elementos del HTML

const form = document.querySelector(".jobs-form");
const queryInput = document.querySelector("#job-query");
const filters = {
    technology: document.querySelector("#technology-filter"),
    location: document.querySelector("#location-filter"),
    contract: document.querySelector("#contract-filter"),
    experience: document.querySelector("#experience-filter"),
};

const listings = document.querySelector("#job-listings");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const errorState = document.querySelector("#error-state");
const pagination = document.querySelector("#pagination");
const selectedApplications = new Set();
const jobsPerPage = 4;
let currentPage = 1;
let availableJobs = [];

// 2. Funciones auxiliares para preparar datos y elementos
function normalize(value = "") {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es");
}

function addFilterOptions(select, values, placeholder) {
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = placeholder;
    fragment.append(defaultOption);

    [...new Set(values.filter(Boolean))]
        .sort((first, second) => first.localeCompare(second, "es"))
        .forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            fragment.append(option);
        });

    select.replaceChildren(fragment);
}

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
}

// 3. Creación y estado de las tarjetas de empleo
function selectApplication(button, job) {
    selectedApplications.add(job.id);
    button.disabled = true;
    button.classList.add("is-applied");
    button.textContent = "Postulación seleccionada";
    button.setAttribute("aria-label", `Postulación seleccionada para ${job.title} en ${job.company}`);
}

function createJobCard(job) {
    const article = document.createElement("article");
    article.className = "job-card";

    const header = document.createElement("header");
    header.className = "job-card-header";

    const companyBlock = document.createElement("div");
    companyBlock.append(createTextElement("p", "job-company", job.company));
    companyBlock.append(createTextElement("p", "job-location", job.location));
    header.append(companyBlock);
    header.append(createTextElement("span", "job-contract", job.contract));

    const title = document.createElement("h3");
    title.className = "job-title";
    const titleLink = document.createElement("a");
    titleLink.href = `./detalle-empleo.html?id=${encodeURIComponent(job.id)}`;
    titleLink.textContent = job.title;
    title.append(titleLink);
    const description = createTextElement("p", "job-description", job.description);
    const detailsLink = document.createElement("a");
    detailsLink.className = "job-view-details";
    detailsLink.href = `./detalle-empleo.html?id=${encodeURIComponent(job.id)}`;
    detailsLink.setAttribute("aria-label", `Ver detalles de ${job.title} en ${job.company}`);
    detailsLink.append(createTextElement("span", "", "Ver detalles"));
    detailsLink.append(createTextElement("span", "job-view-arrow", "→"));

    const tags = document.createElement("ul");
    tags.className = "job-tags";
    tags.setAttribute("aria-label", "Tecnologías y experiencia");
    [...(job.technologies || []), job.experience]
        .filter(Boolean)
        .forEach((tag) => tags.append(createTextElement("li", "", tag)));

    const applyButton = document.createElement("button");
    applyButton.className = "job-apply";
    applyButton.type = "button";
    applyButton.textContent = "Postularme";
    applyButton.setAttribute("aria-label", `Postularme a ${job.title} en ${job.company}`);
    applyButton.addEventListener("click", () => selectApplication(applyButton, job));

    // Mantiene seleccionado el estado al volver a mostrar una tarjeta filtrada.
    if (selectedApplications.has(job.id)) {
        applyButton.disabled = true;
        applyButton.classList.add("is-applied");
        applyButton.textContent = "Postulación seleccionada";
        applyButton.setAttribute("aria-label", `Postulación seleccionada para ${job.title} en ${job.company}`);
    }

    const footer = document.createElement("footer");
    footer.className = "job-card-footer";
    footer.append(detailsLink, applyButton);

    article.append(header, title, description, tags, footer);
    return article;
}

// 4. Búsqueda, filtros y renderizado de resultados
function getFilteredJobs(jobs) {
    const query = normalize(queryInput.value.trim());
    const selectedFilters = Object.fromEntries(
        Object.entries(filters).map(([key, select]) => [key, normalize(select.value)])
    );

    return jobs.filter((job) => {
        const technologyValues = [job.technology, ...(job.technologies || [])].map(normalize);
        const searchableText = normalize([
            job.title,
            job.company,
            job.location,
            job.description,
            job.technology,
            ...(job.technologies || []),
            ...(job.requirements || []),
        ].join(" "));

        return (!query || searchableText.includes(query))
            && (!selectedFilters.technology || technologyValues.includes(selectedFilters.technology))
            && (!selectedFilters.location || normalize(job.location) === selectedFilters.location)
            && (!selectedFilters.contract || normalize(job.contract) === selectedFilters.contract)
            && (!selectedFilters.experience || normalize(job.experience) === selectedFilters.experience);
    });
}

function renderJobs(jobs) {
    const matchingJobs = getFilteredJobs(jobs);
    const pageCount = Math.ceil(matchingJobs.length / jobsPerPage);
    currentPage = Math.min(Math.max(currentPage, 1), Math.max(pageCount, 1));
    const firstJobIndex = (currentPage - 1) * jobsPerPage;
    const fragment = document.createDocumentFragment();

    matchingJobs.slice(firstJobIndex, firstJobIndex + jobsPerPage).forEach((job) => fragment.append(createJobCard(job)));
    listings.replaceChildren(fragment);
    listings.setAttribute("aria-busy", "false");
    resultsCount.textContent = `${matchingJobs.length} ${matchingJobs.length === 1 ? "vacante" : "vacantes"}`;
    emptyState.hidden = matchingJobs.length > 0;
    errorState.hidden = true;
    renderPagination(pageCount);
}

function renderPagination(pageCount) {
    pagination.hidden = pageCount <= 1;
    if (pageCount <= 1) return;

    const pageButtons = pagination.querySelectorAll('[data-page]:not([data-page="previous"]):not([data-page="next"])');
    pageButtons.forEach((button) => {
        const page = Number(button.dataset.page);
        button.hidden = page > pageCount;
        button.classList.toggle("is-current", page === currentPage);

        if (page === currentPage) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
    });

    pagination.querySelector('[data-page="previous"]').disabled = currentPage === 1;
    pagination.querySelector('[data-page="next"]').disabled = currentPage === pageCount;
}

// 5. Eventos del formulario y sincronización de filtros con la URL
function setFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    queryInput.value = params.get("q") || "";
    currentPage = Math.max(1, Number.parseInt(params.get("page"), 10) || 1);

    Object.entries(filters).forEach(([key, select]) => {
        select.value = params.get(key) || "";
    });
}

function updateUrlFromForm() {
    const params = new URLSearchParams();
    if (queryInput.value.trim()) params.set("q", queryInput.value.trim());

    Object.entries(filters).forEach(([key, select]) => {
        if (select.value) params.set(key, select.value);
    });

    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
}

function updateUrlPage() {
    const params = new URLSearchParams(window.location.search);
    if (currentPage > 1) params.set("page", String(currentPage));
    else params.delete("page");
    const queryString = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${queryString ? `?${queryString}` : ""}`);
}

function addFormEventListeners(jobs) {
    availableJobs = jobs;
    queryInput.addEventListener("input", () => { currentPage = 1; renderJobs(jobs); });

    Object.values(filters).forEach((select) => {
        select.addEventListener("change", () => { currentPage = 1; renderJobs(jobs); });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        currentPage = 1;
        updateUrlFromForm();
        renderJobs(jobs);
    });

    pagination.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled || button.hidden) return;

        const pageCount = Math.ceil(getFilteredJobs(availableJobs).length / jobsPerPage);
        if (button.dataset.page === "previous") currentPage -= 1;
        else if (button.dataset.page === "next") currentPage += 1;
        else currentPage = Number(button.dataset.page);

        currentPage = Math.min(Math.max(currentPage, 1), pageCount);
        updateUrlPage();
        renderJobs(availableJobs);
        document.querySelector("#results-heading").scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

// 6. Carga de vacantes y preparación inicial de la página
function populateFilters(jobs) {
    addFilterOptions(filters.technology, jobs.map((job) => job.technology), "Todas las tecnologías");
    addFilterOptions(filters.location, jobs.map((job) => job.location), "Cualquier ubicación");
    addFilterOptions(filters.contract, jobs.map((job) => job.contract), "Cualquier tipo de contrato");
    addFilterOptions(filters.experience, jobs.map((job) => job.experience), "Cualquier nivel");
}

function showLoadingError(error) {
    console.error(error);
    listings.setAttribute("aria-busy", "false");
    listings.replaceChildren();
    errorState.hidden = false;
    resultsCount.textContent = "";
}

async function loadJobs() {
    try {
        const jobs = await getJobs();
        populateFilters(jobs);
        setFiltersFromUrl();
        addFormEventListeners(jobs);
        renderJobs(jobs);
    } catch (error) {
        showLoadingError(error);
    }
}

// 7. Inicio de la aplicación
loadJobs();

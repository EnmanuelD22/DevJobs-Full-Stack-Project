const dataUrl = new URL("../data/info.json", import.meta.url);

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

const normalize = (value = "") => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

function addFilterOptions(select, values, placeholder) {
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = placeholder;
    fragment.append(defaultOption);

    [...new Set(values.filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "es"))
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

function createDetailList(title, items = []) {
    const section = document.createElement("section");
    section.className = "job-detail-section";
    section.append(createTextElement("h4", "", title));

    const list = document.createElement("ul");
    items.forEach((item) => list.append(createTextElement("li", "", item)));
    section.append(list);
    return section;
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

    const title = createTextElement("h3", "job-title", job.title);
    const description = createTextElement("p", "job-description", job.description);

    const tags = document.createElement("ul");
    tags.className = "job-tags";
    tags.setAttribute("aria-label", "Tecnologías y experiencia");
    [...(job.technologies || []), job.experience].filter(Boolean).forEach((tag) => {
        tags.append(createTextElement("li", "", tag));
    });

    const details = document.createElement("details");
    details.className = "job-details";
    details.append(createTextElement("summary", "", "Ver detalles del puesto"));
    details.append(createDetailList("Responsabilidades", job.responsibilities));
    details.append(createDetailList("Requisitos", job.requirements));
    details.append(createTextElement("p", "company-about", job.aboutCompany));

    const applyButton = document.createElement("button");
    applyButton.className = "job-apply";
    applyButton.type = "button";
    applyButton.textContent = "Postularme";
    applyButton.setAttribute("aria-label", `Postularme a ${job.title} en ${job.company}`);
    applyButton.addEventListener("click", () => {
        applyButton.disabled = true;
        applyButton.classList.add("job-apply--selected");
        applyButton.textContent = "Postulación seleccionada";
        applyButton.setAttribute("aria-label", `Postulación seleccionada para ${job.title} en ${job.company}`);
    });

    article.append(header, title, description, tags, details, applyButton);
    return article;
}

function filterJobs(jobs) {
    const query = normalize(queryInput.value.trim());
    const selected = Object.fromEntries(
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
            && (!selected.technology || technologyValues.includes(selected.technology))
            && (!selected.location || normalize(job.location) === selected.location)
            && (!selected.contract || normalize(job.contract) === selected.contract)
            && (!selected.experience || normalize(job.experience) === selected.experience);
    });
}

function renderJobs(jobs) {
    const matches = filterJobs(jobs);
    const fragment = document.createDocumentFragment();

    matches.forEach((job) => fragment.append(createJobCard(job)));
    listings.replaceChildren(fragment);
    listings.setAttribute("aria-busy", "false");
    resultsCount.textContent = `${matches.length} ${matches.length === 1 ? "vacante" : "vacantes"}`;
    emptyState.hidden = matches.length > 0;
    errorState.hidden = true;
}

async function loadJobs() {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`Error al cargar vacantes: ${response.status}`);

        const jobs = await response.json();
        if (!Array.isArray(jobs)) throw new Error("El archivo de vacantes debe contener una lista.");

        addFilterOptions(filters.technology, jobs.map((job) => job.technology), "Todas las tecnologías");
        addFilterOptions(filters.location, jobs.map((job) => job.location), "Cualquier ubicación");
        addFilterOptions(filters.contract, jobs.map((job) => job.contract), "Cualquier tipo de contrato");
        addFilterOptions(filters.experience, jobs.map((job) => job.experience), "Cualquier nivel");

        const params = new URLSearchParams(window.location.search);
        queryInput.value = params.get("q") || "";
        Object.entries(filters).forEach(([key, select]) => {
            select.value = params.get(key) || "";
        });

        queryInput.addEventListener("input", () => renderJobs(jobs));
        Object.values(filters).forEach((select) => {
            select.addEventListener("change", () => renderJobs(jobs));
        });
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const nextParams = new URLSearchParams();
            if (queryInput.value.trim()) nextParams.set("q", queryInput.value.trim());
            Object.entries(filters).forEach(([key, select]) => {
                if (select.value) nextParams.set(key, select.value);
            });
            const queryString = nextParams.toString();
            window.history.replaceState({}, "", `${window.location.pathname}${queryString ? `?${queryString}` : ""}`);
            renderJobs(jobs);
        });

        renderJobs(jobs);
    } catch (error) {
        console.error(error);
        listings.setAttribute("aria-busy", "false");
        listings.replaceChildren();
        errorState.hidden = false;
        resultsCount.textContent = "";
    }
}

loadJobs();

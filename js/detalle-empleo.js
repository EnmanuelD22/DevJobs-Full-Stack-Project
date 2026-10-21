import { getJobs } from "./jobs-data.js";
const detail = document.querySelector("#job-detail");
const notFound = document.querySelector("#job-not-found");
const breadcrumbTitle = document.querySelector("#breadcrumb-title");

function textElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
}

function addListSection(parent, title, items = []) {
    const section = document.createElement("section");
    section.className = "detail-section";
    section.append(textElement("h2", "", title));
    const list = document.createElement("ul");
    items.forEach((item) => list.append(textElement("li", "", item)));
    section.append(list);
    parent.append(section);
}

function renderJob(job) {
    document.title = `${job.title} | DevJobs`;
    breadcrumbTitle.textContent = job.title;

    const hero = document.createElement("header");
    hero.className = "detail-hero";
    const heading = document.createElement("div");
    heading.className = "detail-heading";
    heading.append(textElement("p", "detail-eyebrow", "Oportunidad laboral"));
    heading.append(textElement("h1", "", job.title));
    heading.append(textElement("p", "detail-company", `${job.company} · ${job.location}`));
    const meta = document.createElement("div");
    meta.className = "detail-meta";
    [job.contract, job.experience, job.location].filter(Boolean).forEach((value) => meta.append(textElement("span", "", value)));
    heading.append(meta);
    const apply = textElement("button", "detail-button", "Aplicar ahora");
    apply.type = "button";
    apply.addEventListener("click", () => {
        apply.disabled = true;
        apply.textContent = "Postulación seleccionada";
        apply.setAttribute("aria-label", `Postulación seleccionada para ${job.title} en ${job.company}`);
    });
    hero.append(heading);
    const content = document.createElement("div");
    content.className = "detail-content";
    const main = document.createElement("div");
    main.className = "detail-main";

    const description = document.createElement("section");
    description.className = "detail-section";
    description.append(textElement("h2", "", "Descripción del puesto"));
    description.append(textElement("p", "", job.description));
    main.append(description);
    addListSection(main, "Responsabilidades", job.responsibilities);
    addListSection(main, "Requisitos", job.requirements);

    const aside = document.createElement("aside");
    aside.className = "detail-aside";
    aside.append(textElement("h2", "", "Sobre la empresa"));
    aside.append(textElement("p", "", job.aboutCompany));

    const tags = document.createElement("ul");
    tags.className = "detail-tags";
    tags.setAttribute("aria-label", "Tecnologías del empleo");
    (job.technologies || []).forEach((technology) => tags.append(textElement("li", "", technology)));
    aside.append(tags, apply);
    content.append(main, aside);
    detail.replaceChildren(hero, content);
}

async function loadJob() {
    const id = new URLSearchParams(window.location.search).get("id");
    try {
        const jobs = await getJobs();
        const job = jobs.find((item) => item.id === id);
        if (!job) {
            detail.hidden = true;
            notFound.hidden = false;
            return;
        }
        renderJob(job);
    } catch (error) {
        console.error(error);
        detail.hidden = true;
        notFound.hidden = false;
    }
}

loadJob();

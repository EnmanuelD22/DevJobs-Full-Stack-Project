const jobsUrl = new URL("../data/info.json", import.meta.url);

export async function getJobs() {
    const response = await fetch(jobsUrl);
    if (!response.ok) throw new Error(`No se pudieron cargar las vacantes: ${response.status}`);

    const jobs = await response.json();
    if (!Array.isArray(jobs)) throw new Error("El archivo de vacantes debe contener una lista.");
    return jobs;
}

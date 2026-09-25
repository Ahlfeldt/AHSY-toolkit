const state = {
  metadata: null,
  pyodide: null,
  api: null,
  geography: null,
  paths: null,
  projection: null,
  chart: null,
  product: "res_purchase",
  year: 2025,
  selected: null,
  values: {},
};

const colors = ["#f3f0e9", "#e3dccd", "#cfc1a7", "#b49f7c", "#917956", "#65523a"];
const $ = (id) => document.getElementById(id);

function productInfo() { return state.metadata.products[state.product]; }
function formatValue(value) {
  if (value == null) return "No estimate";
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: state.product === "res_purchase" ? 0 : 2 }).format(value);
}

async function pythonJson(functionName, ...args) {
  const fn = state.api.get(functionName);
  try {
    const result = fn(...args);
    return JSON.parse(result);
  } finally {
    fn.destroy();
  }
}

async function fetchGzipJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not fetch ${url}`);
  const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(stream).text());
}

async function boot() {
  try {
    const base = new URL(".", window.location.href);
    state.metadata = await fetch(new URL("data/metadata.json", base)).then((r) => r.json());
    state.geography = await fetchGzipJson(new URL("data/postcodes.geojson.gz", base));

    state.pyodide = await loadPyodide();
    const python = await fetch(new URL("app.py", base)).then((r) => r.text());
    state.pyodide.runPython(python);
    state.api = state.pyodide.globals;
    const urls = Object.fromEntries(Object.entries(state.metadata.products).map(([key, item]) => [key, new URL(item.file, base).href]));
    const loadData = state.api.get("load_data");
    try { await loadData(JSON.stringify(urls)); } finally { loadData.destroy(); }

    buildControls();
    buildMap();
    buildChart();
    bindEvents();
    await updateProduct();
    setReady("Ready · 8,255 postcode areas");
  } catch (error) {
    console.error(error);
    $("status").className = "status error";
    $("status").textContent = "The atlas could not load. Please refresh or open it in a new tab.";
  }
}

function buildControls() {
  const select = $("product");
  for (const [key, item] of Object.entries(state.metadata.products)) {
    select.add(new Option(item.label, key));
  }
  select.value = state.product;
  for (const id of ["product", "year", "postcode", "search", "reset-map"]) $(id).disabled = false;
}

function buildMap() {
  const container = d3.select("#map");
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;
  const svg = container.append("svg").attr("viewBox", [0, 0, width, height]);
  const layer = svg.append("g");
  state.projection = d3.geoMercator().fitExtent([[18, 16], [width - 18, height - 16]], state.geography);
  const path = d3.geoPath(state.projection);
  state.paths = layer.selectAll("path")
    .data(state.geography.features)
    .join("path")
    .attr("class", "postcode-shape")
    .attr("aria-hidden", "true")
    .attr("data-postcode", (d) => d.properties.postcode)
    .attr("d", path)
    .on("pointermove", showTooltip)
    .on("pointerleave", () => $("tooltip").hidden = true)
    .on("click", (_, d) => selectPostcode(d.properties.postcode));

  const zoom = d3.zoom().scaleExtent([1, 14]).on("zoom", (event) => layer.attr("transform", event.transform));
  svg.call(zoom);
  state.resetZoom = () => svg.transition().duration(450).call(zoom.transform, d3.zoomIdentity);
}

function buildChart() {
  state.chart = new Chart($("history-chart"), {
    type: "line",
    data: { labels: [], datasets: [{ data: [], borderColor: "#857251", backgroundColor: "rgba(133,114,81,.12)", borderWidth: 2.5, pointRadius: 2.5, pointHoverRadius: 5, tension: .18, spanGaps: false, fill: true }] },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${formatValue(ctx.raw)} ${productInfo().unit}` } } },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14 } },
        y: { beginAtZero: false, grid: { color: "#e7e3da" }, ticks: { callback: (v) => formatValue(v) } },
      },
    },
  });
}

function bindEvents() {
  $("product").addEventListener("change", async (event) => { state.product = event.target.value; await updateProduct(); });
  $("year").addEventListener("input", (event) => { state.year = Number(event.target.value); $("year-label").textContent = state.year; });
  $("year").addEventListener("change", async () => {
    if (!state.years.includes(state.year)) {
      state.year = state.years.reduce((closest, year) => Math.abs(year - state.year) < Math.abs(closest - state.year) ? year : closest);
      $("year").value = state.year;
      $("year-label").textContent = state.year;
    }
    await updateMap();
  });
  $("search").addEventListener("click", searchPostcode);
  $("postcode").addEventListener("keydown", (event) => { if (event.key === "Enter") searchPostcode(); });
  $("postcode").addEventListener("input", (event) => { event.target.value = event.target.value.replace(/\D/g, "").slice(0, 5); });
  $("reset-map").addEventListener("click", state.resetZoom);
}

async function updateProduct() {
  const years = await pythonJson("available_years", state.product);
  state.years = years;
  const slider = $("year");
  slider.min = Math.min(...years);
  slider.max = Math.max(...years);
  state.year = years.includes(state.year) ? state.year : Math.max(...years);
  slider.value = state.year;
  $("year-label").textContent = state.year;
  $("map-kicker").textContent = productInfo().label;
  await updateMap();
  if (state.selected) await selectPostcode(state.selected);
}

async function updateMap() {
  state.values = await pythonJson("snapshot", state.product, state.year);
  const values = Object.values(state.values).filter(Number.isFinite).sort((a, b) => a - b);
  const low = d3.quantile(values, .05);
  const high = d3.quantile(values, .95);
  state.color = d3.scaleQuantize([low, high], colors);
  state.paths.attr("fill", (d) => state.values[d.properties.postcode] == null ? "#ddd9cf" : state.color(state.values[d.properties.postcode]));
  $("map-title").textContent = `Price level in ${state.year}`;
  drawLegend(low, high);
  if (state.selected) updateSelectedYear(await pythonJson("history", state.product, state.selected));
}

function drawLegend(low, high) {
  const legend = $("legend");
  legend.replaceChildren();
  const title = document.createElement("span");
  title.className = "legend-title";
  title.textContent = productInfo().unit;
  legend.append(title, Object.assign(document.createElement("span"), { className: "legend-value", textContent: formatValue(low) }));
  for (const color of colors) {
    const swatch = document.createElement("span"); swatch.className = "legend-swatch"; swatch.style.background = color; legend.append(swatch);
  }
  legend.append(Object.assign(document.createElement("span"), { className: "legend-value", textContent: formatValue(high) }));
}

function showTooltip(event, feature) {
  const postcode = feature.properties.postcode;
  const value = state.values[postcode];
  const tooltip = $("tooltip");
  tooltip.innerHTML = `<strong>Postcode ${postcode}</strong><br>${formatValue(value)}${value == null ? "" : ` ${productInfo().unit}`}`;
  tooltip.style.left = `${event.clientX + 14}px`;
  tooltip.style.top = `${event.clientY + 12}px`;
  tooltip.hidden = false;
}

async function selectPostcode(postcode) {
  const history = await pythonJson("history", state.product, postcode);
  if (!history.length) return;
  state.selected = postcode;
  $("postcode").value = postcode;
  $("selected-postcode").textContent = `Postcode ${postcode}`;
  state.paths.classed("selected", (d) => d.properties.postcode === postcode);
  state.chart.data.labels = history.map((row) => row.year);
  state.chart.data.datasets[0].data = history.map((row) => row.value);
  state.chart.update();
  updateSelectedYear(history);
}

function updateSelectedYear(history) {
  const row = history.find((item) => item.year === state.year);
  const unit = productInfo().unit;
  $("selected-value").textContent = row?.value == null ? "No estimate" : formatValue(row.value);
  $("selected-unit").textContent = row?.value == null ? `${productInfo().label}, ${state.year}` : `${unit} · ${state.year}`;
  $("fact-obs").textContent = row?.obs == null ? "—" : new Intl.NumberFormat("en-GB").format(row.obs);
  $("fact-radius").textContent = row?.radius == null ? "—" : `${formatValue(row.radius)} km`;
  $("fact-estimate").textContent = row == null || row.value == null ? "Unavailable" : row.imputed ? "Imputed" : "Estimated";
}

function searchPostcode() {
  const postcode = $("postcode").value.padStart(5, "0");
  if (!state.geography.features.some((feature) => feature.properties.postcode === postcode)) {
    setReady("Postcode not found", true);
    return;
  }
  selectPostcode(postcode);
  setReady("Ready · 8,255 postcode areas");
}

function setReady(message, error = false) {
  $("status").className = `status ${error ? "error" : "ready"}`;
  $("status").textContent = message;
}

window.addEventListener("DOMContentLoaded", boot);

# AHSY-toolkit
Toolkit for micro-geographic commercial property rent indices

**© Gabriel M. Ahlfeldt, Fan Yin**  
Version 0.90, 2026

## General remarks
This toolkit covers the algorithm by [Ahlfeldt, Heblich, Seidel, Yin (2026)](https://github.com/Ahlfeldt/DPs/blob/main/GA_SH_TS_FY_-_Productivity.pdf) to generate micro-geographic commercial rent indices using the RWI-GEO-REDC (v4) dataset. The methodology relies on locally weighted hedonic regressions to recover expected rents for properties with average characteristics at a given location and year.

You must cite the paper when using the index.

The 2025 dataset contains indices between **2007 and 2024** and is available in **wide and long formats**.

Datasets included:

- `AHSY-Index-office-PLZ-2025` – Office rent index  
- `AHSY-Index-retail-PLZ-2025` – Retail rent index

Retail rents are substantially more sparse than office rents. In some years the number of observations is too low to compute reliable index values, which is why they are missing. Even for the other years, we recommend that the values are used primarily for descriptive purposes.

---

# Spatial unit

The index is constructed for **German five-digit postcode regions (PLZ)**.  
Each observation refers to the **postcode centroid**, which serves as the target location of the local regression.

---

# Data formats

### Long format

Each row represents a **postcode–year observation**.

Suitable for:

- panel data analysis
- econometric applications
- time-series analysis

---

### Wide format

Each row represents **one postcode**, with yearly index values stored in separate columns.

Suitable for:

- GIS applications
- mapping
- descriptive statistics

---

# Variable description in long format data sets

## Identification variables

| Variable | Description |
|---|---|
| `postcode` | Five-digit German postcode (PLZ) identifying the spatial unit for which the rent index is computed. |
| `year` | Calendar year of the index estimate (2007–2024). |
| `target_id` | Identifier of the spatial unit used as the target location of the local regression (postcode region). |

---

## Spatial variables

| Variable | Description | Unit |
|---|---|---|
| `target_x` | X-coordinate of the postcode centroid used as the target location of the local regression. | meters |
| `target_y` | Y-coordinate of the postcode centroid used as the target location of the local regression. | meters |

These coordinates allow users to merge the dataset with GIS layers and perform spatial analysis.

---

## Rent index variables

| Variable | Description |
|---|---|
| `lprice_qm` | Predicted log rent per square meter for a commercial unit with average characteristics located in the postcode. |
| `lprice_qm_se` | Standard error of the predicted log rent per square meter. |
| `price_qm` | Predicted rent per square meter (€ / m²) for a commercial unit with average characteristics located in the postcode. This is the main index variable. |
| `price_qm_se` | Standard error of the predicted rent per square meter. |

`price_qm` is obtained by exponentiating `lprice_qm` and applying a smearing correction to account for retransformation bias.

---

## Estimation diagnostics

| Variable | Description | Unit |
|---|---|---|
| `Obs` | Number of listing observations used in the local regression for the postcode-year estimate. | count |
| `Radius` | Spatial radius required to collect the minimum number of observations used in the regression. | meters |
| `Obs_own` | Number of observations located within the inner neighbourhood of the target location. | count |
| `Radius_own` | Radius defining the inner neighbourhood used to capture local price conditions. | meters |
| `Effect_nown` | Estimated coefficient capturing the price difference between observations in the immediate neighbourhood of the postcode and those outside that neighbourhood. | coefficient |

Interpretation:

- smaller `Radius` → denser market with many nearby listings  
- larger `Radius` → thinner market requiring a wider spatial window

---

# Variables in the wide datasets

In the wide datasets, yearly values are stored as separate columns.

| Variable pattern | Description |
|---|---|
| `price_qmYYYY` | Predicted rent per square meter in year YYYY. |
| `price_qm_seYYYY` | Standard error of the predicted rent per square meter in year YYYY. |

Example:

- `price_qm2015` – predicted rent per square meter in 2015  
- `price_qm_se2015` – standard error of the predicted rent in 2015

---

# Interpretation

The index measures the **expected commercial rent per square meter for a unit with average characteristics at a given postcode location and year**.

The estimation controls for compositional differences in listings (e.g. floor area, building age, and time on market). Changes in the index therefore reflect **local price dynamics rather than changes in property composition**.

The estimation window adapts to local data density. In dense markets the algorithm relies on nearby observations, while in sparse markets the radius expands to include a sufficient number of listings.

Within the radius, **nearby observations receive a higher weight**. Weights exponentially decline in distance, reaching one percent of the weight at zero distance at the margin of the search radius. Local characteristics are captured by the neighbourhood fixed effect. Both features of the methodology ensure a local character of the prediction even if the search radius is large.

---

# Suggested citation

If you use this dataset please cite:

Ahlfeldt, Gabriel M., Stephan Heblich, Tobias Seidel, and Fan Yin (2026). *The Price of Productivity.* [https://github.com/Ahlfeldt/DPs/blob/main/GA_SH_TS_FY_-_Productivity.pdf](Working paper).

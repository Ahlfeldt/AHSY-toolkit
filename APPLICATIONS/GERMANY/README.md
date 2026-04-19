# AHSY-toolkit
Toolkit for micro-geographic property commercial rent indices

**© Gabriel M. Ahlfeldt, Fan Yin**

Version 0.90, 2026

## General remarks
This folder contains rent indices generated using the algorithm by [Ahlfeldt, Heblich, Seidel, Yin (2026)](https://github.com/Ahlfeldt/DPs/blob/main/GA_SH_TS_FY_-_Productivity.pdf).

We construct the rent indices for Germany at postcode level and also report the CBD rent and average rent of each local labor market (city). We also provide the shape files necessarily to plot the maps in the subfolder.

## Folders
| Directory | Sub-folder | Description  | Additional Information |
| ------------- | ------ | --- | --- |
| `DATA` | `PLZ-2026` | Folder containing the 2026 version of commercial rent indices at postcode level| Datasets cover time period between 2007 and 2025, using the data released by RWI in 2026. 
| `DATA` | `PLZ-2025` | Folder containing the 2025 version of commercial rent indices at postcode level| Datasets cover time period between 2007 and 2024, using the data released by RWI in 2025. 
| `DATA` | `LLM-2025` | Folder containing indices constructed at local labor market level as weighted average of postcode region level indices. | Same as above.
| `DATA` | `MUNI-2025` | Folder containing the 2026 version of commercial rent indices at municipality level | Same as above.
| `MAPS` |`PLZ` | Folder containing maps generated at postcode level for all years.
| `MAPS` |`Berlin` | Folder containing maps generated for Berlin in all years.
| `SHAPES` | | Folder containing shape files to be merged with datasets under DATA folder to generate the maps.

## Residential indices

Similar residential property price (rent and purchase) indices are available from the [AHS2023-toolkit](https://github.com/Ahlfeldt/AHS2023-toolkit/tree/main/APPLICATIONS/DATA/OUTPUT) based on the methodology developed by [Ahlfeldt, Heblich, Seidel (2023)](https://doi.org/10.1016/j.regsciurbeco.2022.103836). 

https://github.com/Ahlfeldt/AHS2023-toolkit/tree/main/APPLICATIONS/DATA/OUTPUT

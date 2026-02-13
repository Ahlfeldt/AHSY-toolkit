# AHSY-toolkit
Toolkit for micro-geographic property commercial rent indices

**© Gabriel M. Ahlfeldt, Fan Yin**

Version 0.90, 2026

## General remarks
This folder contains rent indices generated using the algorithm by [Ahlfeldt, Heblich, Seidel, Yin (2026)](https://github.com/Ahlfeldt/DPs/blob/main/GA_SH_TS_FY_-_Productivity.pdf)

## Folders
| Directory | Sub-folder | Description  | Additional Information |
| ------------- | ------ | --- | --- |
| `DATA` | `PLZ-2026` | Folder containing the 2026 version of commercial rent indices at postcode level| Datasets cover time period between 2007 and 2024, using the data released by RWI in 2025. 
| `DATA` | `LLM-2026` | Folder containing indices construted at local labor market level as weighted average of postcode region level indices. | Same as above.
| `MAPS` |`PLZ-2026` | Folder containing maps generated at postcode level for all years.
| `MAPS` |`LLM-2026` | Folder containing maps generated at LLM level for all years.
| `SHAPES` | | Folder containing shape files to be merged with datasets under DATA folder to generate the maps.

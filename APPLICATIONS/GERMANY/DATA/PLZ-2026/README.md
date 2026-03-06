# AHSY-toolkit
Toolkit for micro-geographic commercial property rent indices

**© Gabriel M. Ahlfeldt, Fan Yin**  
Version 0.90, 2026

## General remarks
This toolkit covers the algorithm by [Ahlfeldt, Heblich, Seidel, Yin (2026)](https://github.com/Ahlfeldt/DPs/blob/main/GA_SH_TS_FY_-_Productivity.pdf) to generate micro-geographic commercial rent indices using the RWI-GEO-REDC (v4) dataset. The underlying methodology uses locally weighted hedonic regressions to recover expected commercial rents for properties with average characteristics at a given location and year. The resulting indices provide a continuous spatial rent surface even in areas with sparse listing data. You must cite the paper when using the index.

The 2025 version datasets contain indices between 2007 and 2024 and are available in wide and long formats:

`AHSY-Index-office-PLZ-2025` contains the index for office rents.

`AHSY-Index-retail-PLZ-2025` contains the index for retail rents. Notice that retail rents are even scarcer than office rents. In some years, the number of observations is too low to compute reliable index values, which is why they are missing. Even for the other years, we recommend that the values are used primarily for descriptive purposes.

## Spatial unit
The index is constructed for German five-digit postcode areas (PLZ). Each observation refers to a postcode centroid used as the target location of the local regression. In the underlying geography, postcode areas are smaller in dense urban locations and larger in more rural areas.

## Data formats

### Long format
In the long format, each row corresponds to a postcode-year observation.

This format is suitable for:
- panel analysis
- time-series analysis
- econometric applications

### Wide format
In the wide format, each row corresponds to one postcode, and yearly index values are stored in separate columns.

This format is suitable for:
- GIS applications
- mapping
- descriptive analysis

## Variable description

### Identification variables

#### `postcode`
Five-digit German postcode (PLZ) identifying the spatial unit for which the rent index is computed.

#### `year`
Calendar year of the index estimate. The 2025 dataset version covers the period from 2007 to 2024.

#### `target_id`
Identifier of the target spatial unit used in the estimation procedure. In the current version, this corresponds to the postcode region.

### Spatial variables

#### `target_x`
Projected x-coordinate of the postcode centroid used as the target location in the local regression.

Unit: meters.

#### `target_y`
Projected y-coordinate of the postcode centroid used as the target location in the local regression.

Unit: meters.

These variables allow users to merge the dataset with spatial data and to conduct GIS-based analysis.

### Rent index variables

#### `lprice_qm`
Predicted log rent per square meter for a commercial unit with average characteristics located at the postcode centroid.

This is the primary regression output before retransformation into levels.

#### `lprice_qm_se`
Standard error of the predicted log rent per square meter.

This variable measures the statistical uncertainty surrounding `lprice_qm`.

#### `price_qm`
Predicted rent per square meter in euros for a commercial unit with average characteristics located at the postcode centroid.

This variable is obtained by exponentiating `lprice_qm` and applying a smearing correction to account for retransformation bias. It is the main index variable users will typically work with.

#### `price_qm_se`
Standard error of the predicted rent per square meter in levels.

### Estimation diagnostics

#### `Obs`
Number of listing observations used in the local regression for the postcode-year estimate.

Higher values indicate better local data support for the estimate.

#### `Radius`
Spatial radius required to collect the minimum number of observations used in the local regression.

Unit: meters.

Interpretation:
- smaller values indicate denser local markets
- larger values indicate sparser local markets

#### `Obs_own`
Number of observations located within the inner neighbourhood around the target location.

This variable captures the local density of observations close to the postcode centroid.

#### `Radius_own`
Radius defining the inner neighbourhood used to identify local price conditions.

Unit: meters.

#### `Effect_nown`
Estimated coefficient capturing the price difference between observations in the immediate neighbourhood of the target postcode and those outside that neighbourhood.

This term helps ensure that the predicted index reflects local market conditions even when the estimation draws on observations from a broader surrounding area.

## Variables in the wide datasets

In the wide datasets, yearly rent values are stored in separate columns.

#### `price_qmYYYY`
Predicted rent per square meter in year `YYYY`.

Example:
- `price_qm2015`: predicted rent per square meter in 2015

#### `price_qm_seYYYY`
Standard error of the predicted rent per square meter in year `YYYY`.

Example:
- `price_qm_se2015`: standard error of the predicted rent per square meter in 2015

## Interpretation
The index measures the expected commercial rent per square meter for a unit with average characteristics at a given postcode location and year. The construction controls for compositional differences in the underlying listings, including property characteristics such as floor area, age, and time on market. Changes in the index should therefore be interpreted as reflecting local rent dynamics rather than changes in the composition of listed properties.

The estimation window is adaptive: in denser markets, estimates rely on more local information, while in thinner markets, the algorithm expands the radius to include a sufficient number of observations. Users should therefore consult the diagnostic variables such as `Obs`, `Radius`, `Obs_own`, and `Radius_own` when assessing estimate precision.

## Suggested citation
If you use this dataset, please cite:

Ahlfeldt, Gabriel M., Stephan Heblich, Tobias Seidel, and Fan Yin (2026).  
*The Price of Productivity.*

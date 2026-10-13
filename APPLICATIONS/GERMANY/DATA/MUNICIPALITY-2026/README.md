# AHSY municipality indices — 2026 release

**© Gabriel M. Ahlfeldt, Fan Yin**  
Version 0.96, 2026

This release provides AHSY residential rent and purchase-price indices and office and retail rent indices for 10,997 German municipalities and the years 2007–2025. The municipality geography follows the 2021 definition. The `2026` release label denotes data available through 2025.

## Products

- `AHSY-Index-res-RENT-GEM-2026`: residential asking rents;
- `AHSY-Index-res-PURCH-GEM-2026`: residential asking purchase prices;
- `AHSY-Index-office-RENT-GEM-2026`: office asking rents;
- `AHSY-Index-retail-RENT-GEM-2026`: retail asking rents.

Each product is supplied in long and wide form as both CSV and Stata DTA. The long files contain one municipality-year observation; the wide files contain one municipality per row with year-specific price and standard-error columns.

## Important spatial interpretation

The local regression is evaluated at the **municipality centroid**. Accordingly, each reported value is the predicted rent at that centroid; it is not automatically an average over the municipality's entire area or population. This distinction can matter for large municipalities and municipalities with substantial internal spatial variation.

For analysis of within-municipality variation, the postcode (`PLZ`) index is recommended. The postcode estimates can also be aggregated to municipality-level averages using weights suited to the application, such as population, housing stock, employment, or transaction/listing weights. Users should document the chosen crosswalk and weighting scheme.

## Estimation and sparse-data rule

The indices use locally weighted hedonic regressions with adaptive spatial windows. Spatial weights decline exponentially to 0.01 at the margin of the selected window. A municipality-year prediction requires at least 50 observations from that year within the selected window. Missing level estimates are imputed from adjacent years where possible; the associated log estimate and standard error remain missing so imputed observations can be identified.

Residential rent, residential purchase-price, and office rent levels form balanced 2007–2025 panels after imputation. In accordance with the established retail application, retail estimates for 2007, 2008, and 2019–2021 are suppressed.

## Main variables

- `ags`: municipality identifier;
- `year`: calendar year;
- `price_qm`: predicted nominal rent or purchase price per square metre at the municipality centroid;
- `price_qm_se`: standard error of the predicted price or rent level;
- `lprice_qm`: predicted log price or rent per square metre;
- `lprice_qm_se`: standard error of the predicted log price or rent;
- `Obs` and `Radius`: observations and radius used for the local prediction;
- `Obs_own`, `Radius_own`, and `Effect_nown`: diagnostics for the local fixed-effect component;
- `target_x` and `target_y`: projected centroid coordinates in EPSG:25832.

## Citation

Please cite:

Ahlfeldt, Gabriel M., Stephan Heblich, Tobias Seidel, and Fan Yin (2026). *The Price of Productivity.* Berlin School of Economics Discussion Paper 91. [Link](https://github.com/Ahlfeldt/DPs/blob/main/GA_SH_TS_FY_-_Productivity.pdf)

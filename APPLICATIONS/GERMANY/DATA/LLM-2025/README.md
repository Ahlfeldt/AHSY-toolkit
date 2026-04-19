# AHSY-toolkit
Toolkit for micro-geographic property commercial rent indices

**© Gabriel M. Ahlfeldt, Fan Yin**

Version 0.90, 2026

## General remarks
We compute the average commercial rent indix for each local labor market as the weighted average of commercial rent index of each postcode regions within the local labor market, weighted by the commercial floor space of each postcode region. The weights are constructed as the average of commercial floor space between 2007 and 2024, that is, a time-invariant weight.

The PL rent (or CBD rent) is computed as the weighted average of postcode region rent within the prime location, weighted by the area of the surface of the postcode regions that are contained in the prime location. The prime locations are delineated using the AABPL toolkit: https://github.com/Ahlfeldt/AABPL-toolkit-python. This toolkit is based on  G. Ahlfeldt, T. Albers, K. Behrens: Prime Locations (2025): AMERICAN ECONOMIC REVIEW: INSIGHTS, forthcoming.

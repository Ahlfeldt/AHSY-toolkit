"""Build compact browser assets for the AHSY postcode viewer.

Run from the repository root with::

    python WEBTOOL/build_data.py

The script is deliberately separate from the viewer so a new annual release can
be published by rebuilding the assets without changing the application code.
"""

from __future__ import annotations

import gzip
import json
from pathlib import Path

import geopandas as gpd
import pandas as pd
import shapely


ROOT = Path(__file__).resolve().parents[1]
WEBTOOL = ROOT / "WEBTOOL"
OUTPUT = WEBTOOL / "data"
SOURCE = ROOT / "APPLICATIONS" / "GERMANY" / "DATA" / "PLZ-2026"
MUNICIPALITIES = (
    ROOT
    / "APPLICATIONS"
    / "GERMANY"
    / "SHAPES"
    / "MUNICIPALITY_shp"
    / "vg250_gem_clean.shp"
)

STATE_NAMES = {
    "01": "Schleswig-Holstein",
    "02": "Hamburg",
    "03": "Lower Saxony",
    "04": "Bremen",
    "05": "North Rhine-Westphalia",
    "06": "Hesse",
    "07": "Rhineland-Palatinate",
    "08": "Baden-Württemberg",
    "09": "Bavaria",
    "10": "Saarland",
    "11": "Berlin",
    "12": "Brandenburg",
    "13": "Mecklenburg-Vorpommern",
    "14": "Saxony",
    "15": "Saxony-Anhalt",
    "16": "Thuringia",
}

PRODUCTS = {
    "res_purchase": {
        "label": "Residential purchase price",
        "unit": "€ per m²",
        "file": SOURCE
        / "AHSY-Index-res-PLZ-2026"
        / "AHSY-Index-res-PURCH-PLZ-2026-long.csv",
    },
    "res_rent": {
        "label": "Residential rent",
        "unit": "€ per m²/month",
        "file": SOURCE
        / "AHSY-Index-res-PLZ-2026"
        / "AHSY-Index-res-RENT-PLZ-2026-long.csv",
    },
    "office_rent": {
        "label": "Office rent",
        "unit": "€ per m²/month",
        "file": SOURCE
        / "AHSY-Index-office-PLZ-2026"
        / "AHSY-Index-office-RENT-PLZ-2026-long.csv",
    },
    "retail_rent": {
        "label": "Retail rent",
        "unit": "€ per m²/month",
        "file": SOURCE
        / "AHSY-Index-retail-PLZ-2026"
        / "AHSY-Index-retail-RENT-PLZ-2026-long.csv",
    },
}


def postcode(value: object) -> str:
    """Return a five-character German postcode without float artefacts."""
    return f"{int(float(value)):05d}"


def build_geometry() -> None:
    shape = (
        ROOT
        / "APPLICATIONS"
        / "GERMANY"
        / "SHAPES"
        / "PLZ_shp"
        / "postcode_clean_final.shp"
    )
    frame = gpd.read_file(shape)[["ZIP_CODE", "geometry"]]
    frame["postcode"] = frame["ZIP_CODE"].map(postcode)
    frame = frame.drop(columns="ZIP_CODE").to_crs(4326)
    # Quantise without simplifying. Applying the same coordinate grid to every
    # polygon retains shared boundaries and prevents visible wedges at high zoom.
    frame["geometry"] = shapely.set_precision(frame.geometry.array, grid_size=0.00001)
    geometry_path = OUTPUT / "postcodes.geojson.gz"
    with gzip.open(geometry_path, "wt", encoding="utf-8") as stream:
        stream.write(frame.to_json(drop_id=True, separators=(",", ":")))
    obsolete = OUTPUT / "postcodes.topojson"
    if obsolete.exists():
        obsolete.unlink()


def build_state_boundaries() -> None:
    """Build accurate state outlines from the repository's municipality shapes."""
    frame = gpd.read_file(MUNICIPALITIES)[["SN_L", "geometry"]]
    frame = frame.dissolve(by="SN_L", as_index=False)
    # Work in the source's metre-based CRS. This is detailed enough for the
    # viewer's maximum zoom while avoiding a multi-megabyte browser payload.
    frame["geometry"] = frame.geometry.simplify(25, preserve_topology=True)
    frame["name"] = frame["SN_L"].map(STATE_NAMES)
    frame = frame.rename(columns={"SN_L": "state"}).to_crs(4326)
    frame["geometry"] = shapely.set_precision(frame.geometry.array, grid_size=0.00001)
    destination = OUTPUT / "federal_states.geojson.gz"
    with gzip.open(destination, "wt", encoding="utf-8") as stream:
        stream.write(frame.to_json(drop_id=True, separators=(",", ":")))
    obsolete = OUTPUT / "federal_states.geojson"
    if obsolete.exists():
        obsolete.unlink()


def build_product(key: str, config: dict[str, object]) -> dict[str, object]:
    source = Path(config["file"])
    columns = [
        "postcode_id",
        "year",
        "price_qm",
        "price_qm_se",
        "Obs",
        "Radius",
        "lprice_qm",
    ]
    frame = pd.read_csv(source, usecols=columns)
    frame["postcode"] = frame["postcode_id"].map(postcode)
    frame["imputed"] = frame["price_qm"].notna() & frame["lprice_qm"].isna()
    frame = frame.rename(
        columns={"price_qm": "value", "price_qm_se": "se", "Obs": "obs", "Radius": "radius"}
    )[["postcode", "year", "value", "se", "obs", "radius", "imputed"]]
    frame = frame.sort_values(["postcode", "year"])

    destination = OUTPUT / f"{key}.csv.gz"
    with gzip.open(destination, "wt", encoding="utf-8", newline="") as stream:
        frame.to_csv(stream, index=False, float_format="%.5g")

    valid = frame["value"].notna()
    return {
        "label": config["label"],
        "unit": config["unit"],
        "file": f"data/{key}.csv.gz",
        "first_year": int(frame.loc[valid, "year"].min()),
        "last_year": int(frame.loc[valid, "year"].max()),
        "observations": int(valid.sum()),
    }


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    build_geometry()
    build_state_boundaries()
    metadata = {key: build_product(key, config) for key, config in PRODUCTS.items()}
    payload = {
        "edition": "PLZ-2026",
        "geography_count": 8255,
        "products": metadata,
    }
    (OUTPUT / "metadata.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()

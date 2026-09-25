"""Small Pyodide data service for the AHSY postcode viewer."""

from __future__ import annotations

import csv
import gzip
import io
import json
from collections import defaultdict

from pyodide.http import pyfetch


DATA: dict[str, dict[str, list[dict[str, object]]]] = {}


def _number(value: str, integer: bool = False):
    if value == "" or value.lower() == "nan":
        return None
    return int(float(value)) if integer else float(value)


async def load_data(urls_json: str) -> str:
    """Fetch and index all compressed CSV products."""
    urls = json.loads(urls_json)
    for key, url in urls.items():
        response = await pyfetch(url)
        response.raise_for_status()
        raw = gzip.decompress(await response.bytes()).decode("utf-8")
        by_postcode: dict[str, list[dict[str, object]]] = defaultdict(list)
        for row in csv.DictReader(io.StringIO(raw)):
            by_postcode[row["postcode"]].append(
                {
                    "year": _number(row["year"], True),
                    "value": _number(row["value"]),
                    "se": _number(row["se"]),
                    "obs": _number(row["obs"], True),
                    "radius": _number(row["radius"]),
                    "imputed": row["imputed"].lower() == "true",
                }
            )
        DATA[key] = dict(by_postcode)
    return json.dumps({"products": len(DATA), "postcodes": len(next(iter(DATA.values())))})


def snapshot(product: str, year: int) -> str:
    result = {}
    for postcode, rows in DATA[product].items():
        row = next((item for item in rows if item["year"] == year), None)
        if row and row["value"] is not None:
            result[postcode] = row["value"]
    return json.dumps(result, separators=(",", ":"))


def history(product: str, postcode: str) -> str:
    return json.dumps(DATA.get(product, {}).get(postcode, []), separators=(",", ":"))


def available_years(product: str) -> str:
    years = sorted(
        {
            row["year"]
            for rows in DATA[product].values()
            for row in rows
            if row["value"] is not None
        }
    )
    return json.dumps(years)

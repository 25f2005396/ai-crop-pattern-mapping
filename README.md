# AI-Assisted Crop Type and Cropping Pattern Mapping
**Author:** Neelisetty Venkata Naga Teja  
**Institution:** Vellore Institute of Technology, Chennai  
**Program:** India Space Academy — Summer Training Program 2026  

---

## Overview

This project maps crop types and seasonal cropping patterns in **Krishna District, Andhra Pradesh** using multi-season Sentinel-2 satellite imagery and a Random Forest machine learning classifier in Google Earth Engine (GEE).

---

## Study Area

| Parameter | Details |
|---|---|
| District | Krishna |
| State | Andhra Pradesh, India |
| Latitude Range | 15.8°N to 16.8°N |
| Longitude Range | 80.2°E to 81.3°E |
| Area | ~8,727 sq. km |
| Major River | Krishna River |
| Primary Crop (Kharif) | Paddy (Rice) |
| Seasons Covered | Kharif, Rabi, Summer (2023–24) |

---

## Objectives

- Acquire multi-season Sentinel-2 imagery for Krishna District
- Compute NDVI for Kharif, Rabi, and Summer seasons
- Stack seasonal NDVI layers into a multi-temporal feature dataset
- Classify the district into four land-cover classes using Random Forest
- Evaluate accuracy using confusion matrix and Kappa coefficient
- Calculate area statistics per land-cover class (sq. km)
- Export the final classification map as a GeoTIFF

---

## Data Sources

| Data | Source |
|---|---|
| Satellite Imagery | Sentinel-2 SR Harmonized (`COPERNICUS/S2_SR_HARMONIZED`) |
| AOI Boundary | FAO GAUL Level-2 (`FAO/GAUL/2015/level2`) |
| Platform | Google Earth Engine (GEE) |
| Cloud Filter | < 10% cloud cover |

### Seasons & Date Ranges

| Season | Date Range |
|---|---|
| Kharif | 1 Jun 2023 – 30 Nov 2023 |
| Rabi | 1 Nov 2023 – 31 Mar 2024 |
| Summer | 1 Mar 2024 – 31 May 2024 |

---

## Methodology

```
1. Define AOI          → Load Krishna District boundary (FAO GAUL)
2. Load Imagery        → Sentinel-2 SR, 3 seasons, median composite
3. Compute NDVI        → NDVI = (B8 - B4) / (B8 + B4)
4. Visualize           → RGB (B4-B3-B2) + NDVI maps per season
5. Training Samples    → 20 points, 4 classes (12 valid after AOI filter)
6. Feature Stack       → Stack NDVI_Kharif + NDVI_Rabi + NDVI_Summer
7. Train Classifier    → Random Forest (50 trees) via smileRandomForest()
8. Classify            → Apply classifier to full AOI
9. Accuracy Assessment → Confusion matrix, Overall Accuracy, Kappa
10. Area Statistics    → pixelArea() grouped by class
11. Export             → GeoTIFF to Google Drive at 10 m resolution
```

---

## Land Cover Classes

| Class ID | Class Name | Color | Description |
|---|---|---|---|
| 0 | Fallow Land | Brown | Bare / uncultivated land |
| 1 | Single Crop | Orange | One crop per year |
| 2 | Double Crop | Dark Green | Two crops per year |
| 3 | Water Bodies | Deep Sky Blue | Rivers, ponds, coastal water |

---

## Results

### Area Statistics

| Class | Land Cover Type | Area (sq. km) | % of Total |
|---|---|---|---|
| 0 | Fallow Land | 1,941.78 | 23.0% |
| 1 | Single Crop | 3,161.50 | 37.5% |
| 2 | Double Crop | 3,299.83 | 39.1% |
| 3 | Water Bodies | Not separately detected* | — |
| **Total** | **All Classes** | **~8,403.11** | **100%** |

> *Water Bodies training points were filtered out at the AOI boundary step; coastal/river pixels were absorbed into adjacent classes.*

### Accuracy Assessment

| Metric | Value |
|---|---|
| Confusion Matrix | [[4,0,0],[0,5,0],[0,0,3]] |
| Overall Accuracy | 1.0 (100%) |
| Producer Accuracy | [[1],[1],[1]] |
| User Accuracy | [[1,1,1]] |
| Kappa Coefficient | 1.0 |

> **Note:** Accuracy was computed on training samples (resubstitution accuracy). For production use, an independent validation dataset is recommended.

---

## File Structure

```
├── Ai_Crop_Pattern_Mapping.js          # Main GEE JavaScript script
├── Ai_Crop_Pattern_Mapping_Report.pdf  # Full project report
├── Area_of_Interest__AOI__Krishna_District__Andhra_Pradesh_.png
├── Kharif_RGB_Sentinel2.png
├── Rabi_RGB_Sentinel2.png
├── Summer_RGB_Sentinel2.png
├── Kharif_NDVI_Map.png
├── Rabi_NDVI_Map.png
├── Summer_NDVI_Map.png
├── Training_Samples_Map.png
├── AI_Crop_Type_Classification_Map.png
├── Accuracy_Assessment.png
├── Area_Statistics.png
└── README.md
```

---

## How to Run

1. Open [Google Earth Engine Code Editor](https://code.earthengine.google.com/)
2. Copy and paste `Ai_Crop_Pattern_Mapping.js` into a new script
3. Click **Run**
4. Review map layers and console output
5. In the **Tasks** tab, click **RUN** next to `Crop_Classification_2023` to export the GeoTIFF to Google Drive

**Requirements:** A Google Earth Engine account (free at [earthengine.google.com](https://earthengine.google.com))

---

## Key Findings

- **Kharif season** shows the highest NDVI values — confirming intensive paddy cultivation across the Krishna delta
- **Rabi season** shows moderate NDVI in central/northern zones, with post-harvest fallow along the eastern coast
- **Summer season** shows the lowest NDVI, with only scattered irrigated patches remaining active
- **Double Crop** is the dominant land cover (39.1%), concentrated in the Krishna River command area
- **Single Crop** covers 37.5%, distributed across central and eastern portions
- **Fallow Land** accounts for 23.0%, interspersed throughout the district

---

## References

1. Google Earth Engine Documentation — https://developers.google.com/earth-engine
2. Sentinel-2 SR Harmonized Dataset — https://developers.google.com/earthengine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED
3. FAO GAUL Administrative Boundaries — https://developers.google.com/earthengine/datasets/catalog/FAO_GAUL_2015_level2
4. Tucker, C. J. (1979). Red and Photographic Infrared Linear Combinations for Monitoring Vegetation. *Remote Sensing of Environment*, 8(2), 127–150.
5. Breiman, L. (2001). Random Forests. *Machine Learning*, 45(1), 5–32.

---

*India Space Academy | Summer Training Program 2026*
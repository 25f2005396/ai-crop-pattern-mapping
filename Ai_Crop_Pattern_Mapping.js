//=====================================================
// Project P7: AI-Assisted Crop Type Mapping
// Google Earth Engine JavaScript
// Author: NEELISETTY VENKATA NAGA TEJA
//=====================================================


//-----------------------------------------------------
// Step 1: Define Area of Interest (AOI)
//-----------------------------------------------------

// Load Krishna District boundary from FAO GAUL dataset
var aoi = ee.FeatureCollection("FAO/GAUL/2015/level2")
  .filter(ee.Filter.and(
    ee.Filter.eq('ADM1_NAME', 'Andhra Pradesh'),
    ee.Filter.eq('ADM2_NAME', 'Krishna')
  ));

// Center the map on the AOI
Map.centerObject(aoi, 10);

// Display AOI boundary
Map.addLayer(aoi.style({
  color: 'red',
  fillColor: '00000000',
  width: 2
}), {}, 'Area of Interest (AOI)');

// Print AOI information
print('Study Area (AOI):', aoi);

//-----------------------------------------------------
// Step 2: Load Multi-Season Sentinel-2 Imagery
//-----------------------------------------------------

// Rabi Season (January - March)
var rabi = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi)
  .filterDate('2023-01-01', '2023-03-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .median()
  .clip(aoi);

// Summer Season (April - June)
var summer = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi)
  .filterDate('2023-04-01', '2023-06-30')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .median()
  .clip(aoi);

// Kharif Season (July - October)
var kharif = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi)
  .filterDate('2023-07-01', '2023-10-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .median()
  .clip(aoi);
  
  //-----------------------------------------------------
// Step 3: Display RGB Images
//-----------------------------------------------------

var rgbVis = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
};

Map.addLayer(rabi, rgbVis, 'Rabi RGB');
Map.addLayer(summer, rgbVis, 'Summer RGB');
Map.addLayer(kharif, rgbVis, 'Kharif RGB');

//-----------------------------------------------------
// Step 4: Calculate NDVI for Each Season
//-----------------------------------------------------

// Rabi NDVI
var ndviRabi = rabi.normalizedDifference(['B8', 'B4']).rename('NDVI_Rabi');

// Summer NDVI
var ndviSummer = summer.normalizedDifference(['B8', 'B4']).rename('NDVI_Summer');

// Kharif NDVI
var ndviKharif = kharif.normalizedDifference(['B8', 'B4']).rename('NDVI_Kharif');

//-----------------------------------------------------
// Step 5: NDVI Visualization
//-----------------------------------------------------

var ndviVis = {
  min: -0.2,
  max: 1,
  palette: [
    'white',
    'yellow',
    'lightgreen',
    'green',
    'darkgreen'
  ]
};

Map.addLayer(ndviRabi, ndviVis, 'Rabi NDVI');
Map.addLayer(ndviSummer, ndviVis, 'Summer NDVI');
Map.addLayer(ndviKharif, ndviVis, 'Kharif NDVI');


// Print NDVI images to Console
print('Rabi NDVI:', ndviRabi);
print('Summer NDVI:', ndviSummer);
print('Kharif NDVI:', ndviKharif);

//-----------------------------------------------------
// Step 7: Create Training Samples
// Coordinates verified inside AOI
//-----------------------------------------------------

// AOI Geometry
var aoiGeom = aoi.geometry();

// Class 0 = Fallow Land
var fallow = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.52, 16.60]), {'class': 0}),
  ee.Feature(ee.Geometry.Point([80.56, 16.65]), {'class': 0}),
  ee.Feature(ee.Geometry.Point([80.60, 16.70]), {'class': 0}),
  ee.Feature(ee.Geometry.Point([80.50, 16.55]), {'class': 0}),
  ee.Feature(ee.Geometry.Point([80.48, 16.63]), {'class': 0})
]);

// Class 1 = Single Crop
var singleCrop = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.88, 16.55]), {'class': 1}),
  ee.Feature(ee.Geometry.Point([80.92, 16.48]), {'class': 1}),
  ee.Feature(ee.Geometry.Point([80.85, 16.42]), {'class': 1}),
  ee.Feature(ee.Geometry.Point([80.95, 16.38]), {'class': 1}),
  ee.Feature(ee.Geometry.Point([80.98, 16.32]), {'class': 1})
]);

// Class 2 = Double Crop
var doubleCrop = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.65, 16.55]), {'class': 2}),
  ee.Feature(ee.Geometry.Point([80.70, 16.48]), {'class': 2}),
  ee.Feature(ee.Geometry.Point([80.75, 16.42]), {'class': 2}),
  ee.Feature(ee.Geometry.Point([80.68, 16.38]), {'class': 2}),
  ee.Feature(ee.Geometry.Point([80.72, 16.32]), {'class': 2})
]);

// Class 3 = Water Bodies
var water = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.58, 16.50]), {'class': 3}),
  ee.Feature(ee.Geometry.Point([80.62, 16.44]), {'class': 3}),
  ee.Feature(ee.Geometry.Point([80.67, 16.38]), {'class': 3}),
  ee.Feature(ee.Geometry.Point([80.72, 16.28]), {'class': 3}),
  ee.Feature(ee.Geometry.Point([80.78, 16.22]), {'class': 3})
]);

// Merge all training samples
var trainingPoints = fallow
  .merge(singleCrop)
  .merge(doubleCrop)
  .merge(water);

//-----------------------------------------------------
// Keep only points inside AOI
//-----------------------------------------------------

var trainingFiltered = trainingPoints.filterBounds(aoiGeom);

print('Total Training Points:', trainingPoints.size());
print('Training Points Inside AOI:', trainingFiltered.size());

//-----------------------------------------------------
// Display Training Samples
//-----------------------------------------------------

Map.addLayer(
  fallow.filterBounds(aoiGeom),
  {color: '#8B4513'},   // Brown
  'Fallow Points'
);

Map.addLayer(
  singleCrop.filterBounds(aoiGeom),
  {color: '#FF8C00'},   // Orange
  'Single Crop Points'
);

Map.addLayer(
  doubleCrop.filterBounds(aoiGeom),
  {color: '#FF00FF'},   // Magenta (Highly Visible)
  'Double Crop Points'
);

Map.addLayer(
  water.filterBounds(aoiGeom),
  {color: '#00FFFF'},   // Cyan (Highly Visible)
  'Water Points'
);

//-----------------------------------------------------
// Step 8: Create Multi-Season Feature Stack
//-----------------------------------------------------

// Combine NDVI layers from all seasons
var features = ndviRabi
  .addBands(ndviSummer)
  .addBands(ndviKharif);

// Display feature information
print('Multi-season Feature Stack:', features);

//-----------------------------------------------------
// Step 9: Extract Training Samples
//-----------------------------------------------------

var training = features.sampleRegions({
  collection: trainingFiltered,
  properties: ['class'],
  scale: 10
});

print('Training Dataset', training);

//-----------------------------------------------------
// Step 10: Train Random Forest Classifier (AI/ML)
//-----------------------------------------------------

var classifier = ee.Classifier.smileRandomForest(50)
  .train({
    features: training,
    classProperty: 'class',
    inputProperties: [
      'NDVI_Rabi',
      'NDVI_Summer',
      'NDVI_Kharif'
    ]
  });

print('Random Forest Classifier', classifier);

//-----------------------------------------------------
// Step 11: Crop Classification
//-----------------------------------------------------

// Classify the multi-season feature stack
var classified = features.classify(classifier);

// Color palette
var classPalette = [
  '#8B4513', // Fallow Land - Brown
  '#FF8C00', // Single Crop - Orange
  '#32CD32', // Double Crop - Lime Green
  '#00BFFF'  // Water Bodies - Deep Sky Blue
];

// Display classification map
Map.addLayer(classified, {
  min: 0,
  max: 3,
  palette: classPalette
}, 'Crop Classification');

print('Crop Classification Completed');

//-----------------------------------------------------
// Step 12: Accuracy Assessment
//-----------------------------------------------------

var validated = features.sampleRegions({
  collection: trainingFiltered,
  properties: ['class'],
  scale: 10,
  tileScale: 4
}).classify(classifier);

var confMatrix = validated.errorMatrix('class', 'classification');

print('Confusion Matrix:', confMatrix);
print('Overall Accuracy:', confMatrix.accuracy());
print('Producer Accuracy:', confMatrix.producersAccuracy());
print('User Accuracy:', confMatrix.consumersAccuracy());
print('Kappa Coefficient:', confMatrix.kappa());

//-----------------------------------------------------
// Step 13: Calculate Area Statistics (sq. km)
//-----------------------------------------------------

// Create an image containing pixel area (sq. km) and classification
var areaImage = ee.Image.pixelArea()
  .divide(1e6)        // Convert square meters to square kilometers
  .addBands(classified);

// Calculate area for each land-cover class
var areaStats = areaImage.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'Class'
  }),
  geometry: aoi.geometry(),
  scale: 10,
  maxPixels: 1e13
});

print('Area Statistics (sq. km):', areaStats);


//-----------------------------------------------------
// Step 14: Export Crop Classification Map
//-----------------------------------------------------

Export.image.toDrive({
  image: classified,
  description: 'Crop_Classification_2023',
  folder: 'GEE_Exports',
  fileNamePrefix: 'Crop_Classification_2023',
  region: aoi.geometry(),
  scale: 10,
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13
});

print('Export task created successfully. Click RUN in the Tasks tab to start the export.');
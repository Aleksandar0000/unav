/*
 * uNav https://github.com/costales/unav
 * Copyright (C) 2015-2020 Marcos Alvarez Costales https://costales.github.io
 *
 * uNav is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * uNav is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

 MapUI.prototype.TIME_ANIMATION = 400;

function MapUI() {
	this.GPXSource = new ol.source.Vector({});
	this.layerGPX = new ol.layer.Vector({
		source: this.GPXSource,
		style: [
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#ff0015',
					width: 5
				})
			})
		]
	});
	map.addLayer(this.layerGPX);
	this.layerGPX.setZIndex(100);
	this.layerGPX.set('name', 'gpx');

	this.RouteSource = new ol.source.Vector({});
	this.layerRoute = new ol.layer.Vector({
		source: this.RouteSource,
		style: [
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#5846c5',
					width: 5
				})
			})
		]
	});
	map.addLayer(this.layerRoute);
	this.layerRoute.setZIndex(101);
	this.layerRoute.set('name', 'route');

	this.markerPOISource = new ol.source.Vector({});
	this.layerPOI = new ol.layer.Vector({source: this.markerPOISource});
	map.addLayer(this.layerPOI);
	this.layerPOI.setZIndex(102);
	this.layerPOI.set('name', 'poi');

	this.markerRadarSource = new ol.source.Vector({});
	this.layerRadar = new ol.layer.Vector({source: this.markerRadarSource});
	map.addLayer(this.layerRadar);
	this.layerRadar.setZIndex(103);
	this.layerRadar.set('name', 'poi');

	this.posFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([-5.7,43.533333])),
        name: 'pos'
	});
	this.posStyle = new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [20, 20],
			anchorXUnits: 'pixels',
			anchorYUnits: 'pixels',
			src: 'img/marker/car.svg'
		})
	});
	this.posFeature.setStyle(this.posStyle);
	this.markerPosSource = new ol.source.Vector({features: [this.posFeature]});
	this.layerPos = new ol.layer.Vector({source: this.markerPosSource});
	map.addLayer(this.layerPos);
	this.layerPos.setZIndex(104);
	this.layerPos.set('name', 'pos');
	this.layerPos.setVisible(false);
}

MapUI.prototype.get_map_zoom = function() {
	return map.getView().getZoom();
}
MapUI.prototype.set_map_zoom = function(zoom) {
	map.getView().setZoom(zoom);
}

MapUI.prototype.set_map_center = function(lng, lat, animation) {
	var anima = animation || false;
	if (anima)
		view.animate({
			center: ol.proj.fromLonLat([lng, lat]),
			duration: this.TIME_ANIMATION,
			easing: ol.easing.easeOut
		});
	else
		map.getView().setCenter(ol.proj.fromLonLat([lng, lat]));
}

MapUI.prototype.set_map_rotate = function(degrees) {
	if (degrees == map.getView().getRotation())
		return;
	map.getView().setRotation(maths.deg2rad(degrees));
}

MapUI.prototype.set_marker_rotate = function(degrees) {
	this.posStyle.getImage().setRotation(maths.deg2rad(degrees));
	this.posFeature.changed();
}

MapUI.prototype.set_map_fit_box = function(lng1, lat1, lng2, lat2) { // coords: bottom,left,top,right
	var coords = [parseFloat(lng1), parseFloat(lat1), parseFloat(lng2), parseFloat(lat2)];
	var extent_aux = ol.extent.applyTransform(coords, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
	map.getView().fit(extent_aux, {size: map.getSize(), padding: [150, 50, 150, 50]});
}

MapUI.prototype.add_marker = function(markers, layer) {
	switch(layer) {
		case 'poi':
			var layer_aux = this.markerPOISource;
			break;
		case 'radar':
			var layer_aux = this.markerRadarSource;
			break;
		case 'route':
			var layer_aux = this.RouteSource;
			break;
		case 'gpx':
			var layer_aux = this.GPXSource;
			break;
	}
	for (z=0; z < markers.length; z++) {
		var iconFeature = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(markers[z].lng), parseFloat(markers[z].lat)])),
			name: markers[z].name,
			lng: markers[z].lng,
			lat: markers[z].lat,
			title: markers[z].title,
			phone: markers[z].phone,
			website: markers[z].website,
			email: markers[z].email // Add extra info marker fields here for read them at click on map
		});

		var iconStyle = new ol.style.Style({
			image: new ol.style.Icon({
				anchor: [markers[z].margin_width, markers[z].margin_height],
				anchorXUnits: "pixels",
				anchorYUnits: "pixels",
				src: 'img/' + markers[z].icon
			})
		});
		iconFeature.setStyle(iconStyle);
		layer_aux.addFeature(iconFeature);
	}
}

MapUI.prototype.clear_layer = function(layer) {
	switch(layer) {
		case 'poi':
			var layer_aux = this.markerPOISource;
			break;
		case 'radar':
			var layer_aux = this.markerRadarSource;
			break;
		case 'route':
			var layer_aux = this.RouteSource;
			break;
		case 'gpx':
			var layer_aux = this.GPXSource;
			break;
	}
	layer_aux.clear();
}

MapUI.prototype.show_route = function(coords, layer, fit) {
	var fit_map = fit || false;

	switch(layer) {
		case 'route': // Route
			var layer_aux = this.RouteSource;
			break;
		case 'gpx': // GPX
			var layer_aux = this.GPXSource;
			break;
		default:
			return;
	}
	
	var lineString = new ol.geom.LineString(coords);
	lineString.transform('EPSG:4326', 'EPSG:3857');
	layer_aux.addFeature(new ol.Feature({geometry: lineString}));

	if (fit_map)
		map.getView().fit(lineString, {size: map.getSize(), padding: [150, 50, 150, 50]});
}


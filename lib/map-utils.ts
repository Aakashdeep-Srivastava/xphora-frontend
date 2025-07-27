import type * as google from "google.maps"

const BENGALURU_CENTER = {
  lat: 12.9716,
  lng: 77.5946,
}

export const mapOptions: google.maps.MapOptions = {
  center: BENGALURU_CENTER,
  zoom: 12,
  mapTypeId: "roadmap",
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
}

export const mobileMapOptions: google.maps.MapOptions = {
  ...mapOptions,
  gestureHandling: "greedy",
  zoomControl: false,
  disableDefaultUI: true,
}

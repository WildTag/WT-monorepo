import { GoogleMap, Marker, MarkerClusterer } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { Position } from "../../types/Position";

const containerStyle = {
  display: "flex",
  width: "100%",
  height: "100vh",
};

const PinPointMap = () => {
  const [pinPoint, setPinPoint] = useState<Position>({ lat: 0, lng: 0 });
  const [position, setPosition] = useState<Position>({
    lat: 53.1047,
    lng: -1.5624,
  });

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      (error) => {
        setPosition((prevState) => ({
          ...prevState,
          loaded: true,
          error,
        }));
      }
    );
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position}
      zoom={9}
      options={{
        minZoom: 2,
        maxZoom: 16,
        fullscreenControl: false,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      }}
      onClick={(e) => {
        console.log(e.latLng?.lat(), e.latLng?.lng());
        setPinPoint({
          lat: e.latLng?.lat() || 0,
          lng: e.latLng?.lng() || 0,
        });
      }}
    >
      <Marker position={{ lat: pinPoint.lat, lng: pinPoint.lng }} />
    </GoogleMap>
  );
};

export default PinPointMap;

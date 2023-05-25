import { GoogleMap, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { Position } from "../../types/Position";
import { Title, Text } from "@mantine/core";

const containerStyle = {
  display: "flex",
  width: "100%",
  height: "100vh",
};

interface PinPointMapProps {
  displayPinPointMap: boolean;
  form: any;
}

const PinPointMap = ({ displayPinPointMap, form }: PinPointMapProps) => {
  const [pinPoint, setPinPoint] = useState<Position>({ lat: 0, lng: 0 });
  const [position, setPosition] = useState<Position>({
    lat: 53.1047,
    lng: -1.5624,
  });

  useEffect(() => {
    form.setFieldValue("gps_lat", pinPoint.lat);
    form.setFieldValue("gps_long", pinPoint.lng);
  }, [pinPoint]);

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
    <>
      {displayPinPointMap && (
        <>
          <Title>Where was this photo taken?</Title>
          <Text>Please click on the position on the map where this photo was taken</Text>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={position}
            zoom={9}
            options={{
              draggableCursor: "crosshair",
              minZoom: 2,
              maxZoom: 16,
              fullscreenControl: false,
              styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
            }}
            onClick={(e) => {
              setPinPoint({
                lat: e.latLng?.lat() || 0,
                lng: e.latLng?.lng() || 0,
              });
              console.log({
                lat: e.latLng?.lat() || 0,
                lng: e.latLng?.lng() || 0,
              });
            }}
          >
            <Marker position={{ lat: pinPoint.lat, lng: pinPoint.lng }} />
          </GoogleMap>
        </>
      )}
    </>
  );
};

export default PinPointMap;

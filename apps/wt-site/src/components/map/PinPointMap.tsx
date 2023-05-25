import { GoogleMap, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { Position } from "../../types/Position";
import { Title, Text } from "@mantine/core";

const containerStyle = {
  width: "100%",
  height: "50vh",
};

interface PinPointMapProps {
  form: any;
}

const PinPointMap = ({ form }: PinPointMapProps) => {
  const defaultPos = form.values.gps_lat
    ? { lat: form.values.gps_lat, lng: form.values.gps_long }
    : { lat: null, lng: null };
  const [pinPoint, setPinPoint] = useState<Position>(defaultPos);
  const [position, setPosition] = useState(defaultPos);

  useEffect(() => {
    form.setFieldValue("gps_lat", pinPoint.lat);
    form.setFieldValue("gps_long", pinPoint.lng);
  }, [pinPoint]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    if (position.lat || position.lng) return;
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
      <Title>Where was this photo taken?</Title>
      <Text>Please click on the position on the map where this photo was taken</Text>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={7}
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
        }}
      >
        {pinPoint.lat && pinPoint.lng && (
          <Marker
            position={{ lat: pinPoint.lat, lng: pinPoint.lng }}
            onClick={() => {
              setPinPoint({ lat: null, lng: null });
            }}
          />
        )}
      </GoogleMap>
    </>
  );
};

export default PinPointMap;

import { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Filter } from "tabler-icons-react";
import Popup from "../popup/Popup";

export default function Map() {
  const [open, setOpen] = useState(false);
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100vh",
  };

  const center = {
    lat: 53.1047,
    lng: -1.5624,
  };

  return (
    <>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_API_GOOGLEMAP}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={8}
          options={{ minZoom: 6, maxZoom: 16, fullscreenControl: false }}
        >
          <Marker
            position={center}
            icon={""}
            onClick={() => {
              setOpen(!open);
            }}
          />
          {open && <Popup latitude={center.lat} longitude={center.lng} />}
        </GoogleMap>
      </LoadScript>
    </>
  );
}

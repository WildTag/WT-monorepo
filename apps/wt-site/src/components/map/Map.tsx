import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

function Map() {
  const containerStyle = {
    display: "flex",
    width: "100%vh",
    height: "100%",
  };

  const center = {
    lat: 53.1047,
    lng: -1.5624,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "924px",
        width: "1920px",
      }}
    >
      <LoadScript googleMapsApiKey={import.meta.env.VITE_API_GOOGLEMAP}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={8}>
          {/* Child components, such as markers, info windows, etc. */}
          <></>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Map;

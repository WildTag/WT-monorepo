import { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Filter } from "tabler-icons-react";
import Popup from "../popup/Popup";

interface MapProps {
  posts: any;
}

export default function Map({ posts }: MapProps) {
  const [open, setOpen] = useState(false);
  const [s, ss] = useState<any>({
    lat: 53.1047,
    lng: -1.5624,
  });
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100vh",
  };

  return (
    <>
      <LoadScript googleMapsApiKey={import.meta.env.VITE_API_GOOGLEMAP}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={s}
          zoom={8}
          options={{ minZoom: 2, maxZoom: 16, fullscreenControl: false }}
        >
          {posts?.map((post: any) => {
            console.log(post);
            return (
              <Marker
                position={{ lat: post.GPSLat, lng: post.GPSLong }}
                icon={""}
                onClick={() => {
                  setOpen(!open);
                  ss({ lat: post.GPSLat, lng: post.GPSLong });
                }}
              >
                {open && <Popup latitude={post.GPSLat} longitude={post.GPSLong} post={post} />}
              </Marker>
            );
          })}
        </GoogleMap>
      </LoadScript>
    </>
  );
}

import { useState } from "react";
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from "@react-google-maps/api";
import { Filter } from "tabler-icons-react";
import Popup from "../popup/Popup";

interface MapProps {
  posts: any;
}

export default function Map({ posts }: MapProps) {
  const [selectedPost, setSelectedPost] = useState<any | null>();
  const [position, setPosition] = useState<any>({
    lat: 53.1047,
    lng: -1.5624,
  });
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100vh",
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_API_GOOGLEMAP}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={8}
        options={{ minZoom: 2, maxZoom: 16, fullscreenControl: false }}
      >
        <MarkerClusterer
          options={{
            gridSize: 50,
            maxZoom: 15,
          }}
        >
          {(clusterer) =>
            posts?.map((post: any) => (
              <Marker
                position={{ lat: post.GPSLat, lng: post.GPSLong }}
                onClick={() => {
                  setSelectedPost(post);
                  setPosition({ lat: post.GPSLat, lng: post.GPSLong });
                }}
                clusterer={clusterer}
              >
                {selectedPost?.pictureId === post?.pictureId && (
                  <Popup latitude={post.GPSLat} longitude={post.GPSLong} post={post} />
                )}
              </Marker>
            ))
          }
        </MarkerClusterer>
      </GoogleMap>
    </LoadScript>
  );
}

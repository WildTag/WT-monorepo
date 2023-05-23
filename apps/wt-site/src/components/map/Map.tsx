import { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  MarkerClusterer,
  useJsApiLoader,
} from "@react-google-maps/api";
import Popup from "../popup/Popup";
import { Post } from "../../types/Post";

interface MapProps {
  posts: Post[] | null;
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

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_API_GOOGLEMAP,
  });

  return (
    <>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={6}
          options={{ minZoom: 2, maxZoom: 16, fullscreenControl: false }}
        >
          <MarkerClusterer
            options={{
              gridSize: 50,
              maxZoom: 15,
            }}
          >
            {(clusterer) => (
              <>
                {posts?.map((post: Post) => (
                  <Marker
                    key={post.pictureId} // Don't forget to provide a key when mapping!
                    position={{ lat: post.GPSLat, lng: post.GPSLong }}
                    onClick={() => {
                      if (selectedPost?.pictureId === post.pictureId) return setSelectedPost(null);
                      setSelectedPost(post);
                      setPosition({ lat: post.GPSLat, lng: post.GPSLong });
                    }}
                    clusterer={clusterer}
                  >
                    {selectedPost?.pictureId === post?.pictureId ? (
                      <Popup latitude={post.GPSLat} longitude={post.GPSLong} post={post} />
                    ) : (
                      <></>
                    )}
                  </Marker>
                ))}
              </>
            )}
          </MarkerClusterer>
        </GoogleMap>
      )}
    </>
  );
}

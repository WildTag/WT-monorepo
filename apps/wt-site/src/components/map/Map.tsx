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

const markers = {
  duck: "/markerImages/duckMarker.png",
  swan: "/markerImages/swanMarker.png",
  heron: "/markerImages/heronMarker.png",
  pidgeon: "/markerImages/pidgeonMarker.png",
  magpie: "/markerImages/magpieMarker.png",
  chaffinch: "/markerImages/chaffinchMarker.png",
  badger: "/markerImages/badgerMarker.png",
  stoat: "/markerImages/stoatMarker.png",
  squirrel: "/markerImages/squirrelMarker.png",
  other: "/markerImages/otherMarker.png",
};

export default function Map({ posts }: MapProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>();
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
                console.log()
                {posts?.map((post: Post) => (
                  <>
                    {console.log(post)}
                    <Marker
                      key={post.pictureId} // Don't forget to provide a key when mapping!
                      position={{ lat: post.GPSLat, lng: post.GPSLong }}
                      icon={{
                        url: markers[post.postTags[0].tag.toLowerCase()],
                        scaledSize: new window.google.maps.Size(40, 60),
                      }}
                      onClick={() => {
                        if (selectedPost?.pictureId === post.pictureId)
                          return setSelectedPost(null);
                        setSelectedPost(post);
                        setPosition({ lat: post.GPSLat, lng: post.GPSLong });
                      }}
                      clusterer={clusterer}
                    >
                      {selectedPost?.pictureId === post?.pictureId ? (
                        <Popup
                          latitude={post.GPSLat}
                          longitude={post.GPSLong}
                          post={post}
                          setSelectedPost={setSelectedPost}
                        />
                      ) : (
                        <></>
                      )}
                    </Marker>
                  </>
                ))}
              </>
            )}
          </MarkerClusterer>
        </GoogleMap>
      )}
    </>
  );
}

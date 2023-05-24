import { useState } from "react";
import { GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { Post } from "../../types/Post";
import { Drawer, ScrollArea, Image, Group, Text, useMantineTheme, Divider } from "@mantine/core";

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
  const theme = useMantineTheme();
  const [selectedPost, setSelectedPost] = useState<Post | null>();
  const [openDrawer, setOpenDrawer] = useState(false);
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
      <div>
        <Drawer
          title={selectedPost?.title || ""}
          opened={openDrawer}
          onClose={() => {
            setOpenDrawer(false);
            setSelectedPost(null);
          }}
          scrollAreaComponent={ScrollArea.Autosize}
          styles={{
            title: {
              fontSize: theme.fontSizes.xl,
              fontWeight: "bold",
            },
          }}
        >
          <Group>
            <Image
              src={`data:image/jpeg;base64,${selectedPost?.image || ""}`}
              fit="contain"
              radius={10}
            />
            <div
              style={{
                background: theme.colors.dark[6],
                borderRadius: theme.radius.sm,
                padding: theme.spacing.sm,
                width: "100%",
              }}
            >
              <Text pb={3} weight={500}>
                Description
              </Text>
              <Divider size="md" />
              <Text>{selectedPost?.description}</Text>
            </div>
            <div title="comments">
              <Text>{selectedPost?.comments}</Text>
            </div>
          </Group>
        </Drawer>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={position}
            zoom={6}
            options={{ minZoom: 2, maxZoom: 16 }}
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
                      key={post.pictureId}
                      position={{ lat: post.GPSLat, lng: post.GPSLong }}
                      icon={{
                        url: markers[post.postTags[0].tag.toLowerCase()],
                        scaledSize: new window.google.maps.Size(40, 60),
                      }}
                      onClick={() => {
                        setSelectedPost(post);
                        setOpenDrawer(true);
                        setPosition({ lat: post.GPSLat, lng: post.GPSLong });
                      }}
                      clusterer={clusterer}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
          </GoogleMap>
        )}
      </div>
    </>
  );
}

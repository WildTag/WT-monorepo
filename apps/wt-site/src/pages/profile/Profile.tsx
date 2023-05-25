import React, { useEffect, useState } from "react";
import { ProfileNavbar } from "../../components/navbars/ProfileNavbar";
import {
  Container,
  Image,
  useMantineTheme,
  Box,
  Text,
  Flex,
  AspectRatio,
  SimpleGrid,
  Divider,
  Group,
} from "@mantine/core";
import { Account } from "../../types/Account";
import { Post } from "../../types/Post";
import { Loading } from "../../components/loading/Loading";
const links = [
  {
    link: "/",
    label: "Home",
  },
];
export default function Profile() {
  const accessToken = localStorage.getItem("sessionToken");
  const theme = useMantineTheme();
  const [accountInfo, setAccountInfo] = useState<Account | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [getPosts, setGetPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function getAccountInfo() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/account/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken || "",
        },
      });
      const data = await response.json();
      setAccountInfo(data);
      setIsFetching(false);
    }
    setIsFetching(true);

    getAccountInfo();
  }, []);

  useEffect(() => {
    async function getPosts() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${accountInfo?.accountId}/posts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken || "",
          },
        }
      );
      if (response.status !== 200) return;
      const data = await response.json();
      setGetPosts(data);
      setIsFetchingPosts(false);
    }
    if (!accountInfo) {
      return;
    }
    setIsFetchingPosts(true);
    getPosts();
  }, [accountInfo]);

  if (!accountInfo) return <Loading />;

  return (
    <>
      <ProfileNavbar links={links}></ProfileNavbar>
      <Container>
        <div style={{ marginBottom: "10px" }}>
          <Box
            style={{
              marginRight: "10px",
              backgroundColor: theme.colors.dark[6],
              borderRadius: 10,
              padding: 10,
              width: "100%",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <AspectRatio ratio={16 / 16} maw={400} mx="auto" style={{}}>
                <Image
                  display={"inline-block"}
                  src={`data:image/jpeg;base64,${accountInfo?.profileImage}`}
                  radius={theme.radius.md}
                />
              </AspectRatio>
            </div>
            <div style={{ width: "100%", fontWeight: "bold" }}>
              <Text>Details</Text>
              <Divider size={"md"} />

              <Group>
                <Text>{accountInfo?.username}</Text>
                <Divider orientation="vertical" size={"md"} />
                <Text>Posts: {getPosts.length}</Text>
              </Group>
              <Text>{new Date(accountInfo.created).toDateString()}</Text>
            </div>
          </Box>
        </div>
        <Flex style={{ marginBottom: 10 }}>
          <SimpleGrid>
            <div>
              <Flex wrap={"wrap"} gap={15}>
                {getPosts.map((value) => {
                  return (
                    <>
                      <div
                        style={{
                          backgroundColor: theme.colors.dark[6],
                          padding: theme.spacing.md,
                          borderRadius: theme.radius.md,
                          width: "1000px",
                          fontWeight: "bold",
                        }}
                      >
                        <Text size={20} style={{ marginBottom: 10 }}>
                          {value.title}
                        </Text>

                        <Image
                          radius={10}
                          fit="contain"
                          src={`data:image/jpeg;base64,${value.image}`}
                        ></Image>

                        <Text style={{ marginTop: 4, marginBottom: 4 }}>Description</Text>
                        <Divider size={"lg"} />
                        <Text weight={"normal"} size={16}>
                          {value.description}
                        </Text>

                        <Text style={{ float: "right" }}>
                          {new Date(value.created).toDateString()}
                        </Text>
                      </div>
                    </>
                  );
                })}
              </Flex>
            </div>
          </SimpleGrid>
        </Flex>
      </Container>
    </>
  );
}

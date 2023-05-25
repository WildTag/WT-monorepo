import React, { useEffect, useState } from "react";
import { ProfileNavbar } from "../../components/navbars/ProfileNavbar";
import { Container, Image, useMantineTheme, Box, Text, Center, Flex } from "@mantine/core";
import { Account } from "../../types/Account";
import { Post } from "../../types/Post";
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
  const [getPosts, setGetPosts] = useState<Post | null>(null);

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

  return (
    <>
      <ProfileNavbar links={links}></ProfileNavbar>
      <Box
        style={{
          float: "left",
          display: "inline-block",
          position: "relative",
          paddingLeft: "250px",
          width: "600px",
        }}
      >
        <Flex>
          <Image
            display={"inline-block"}
            width={128}
            height={128}
            src={`data:image/jpeg;base64,${accountInfo?.profileImage}`}
            radius={theme.radius.md}
          ></Image>
        </Flex>
        <Text
          align="left"
          style={{ width: "100%", paddingTop: 10 }}
        >{`@${accountInfo?.username}`}</Text>
      </Box>
      <Text></Text>
    </>
  );
}

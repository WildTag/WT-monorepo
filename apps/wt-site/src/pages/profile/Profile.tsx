import React from "react";
import { ProfileNavbar } from "../../components/navbars/ProfileNavbar";
const links = [
  {
    link: "/",
    label: "Home",
  },
];
export default function Profile() {
  return (
    <>
      <ProfileNavbar links={links}></ProfileNavbar>
    </>
  );
}

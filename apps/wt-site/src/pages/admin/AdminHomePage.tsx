import { useEffect, useState } from "react";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { Table, Title } from "@mantine/core";
import { AdminLog } from "../../types/AdminLog";

const AdminHomePage = () => {
  const accessToken = localStorage.getItem("sessionToken");
  const [isFetching, setIsFetching] = useState(false);
  const [logData, setLogData] = useState<AdminLog[]>([]);

  useEffect(() => {
    async function getAdminLogs() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/logs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken || "",
        },
      });
      if (response.status !== 200) return (window.location.href = "/");
      const data = await response.json();
      setLogData(data);
      setIsFetching(false);
    }
    setIsFetching(true);
    getAdminLogs();
  }, []);

  return (
    <CustomAppShell selected={0}>
      {logData.length === 0 ? (
        <Title>There are currently no admin logs to display</Title>
      ) : (
        <Table striped highlightOnHover withColumnBorders>
          <thead>
            <tr>
              <th>id </th>
              <th>performedByUserId</th>
              <th>datetime </th>
              <th>type </th>
              <th>pictureId </th>
              <th>accountId </th>
            </tr>
          </thead>
          <tbody>
            {logData?.map((value) => {
              return (
                <>
                  <tr key={value.id}>
                    <td>{value.id}</td>
                    <td>{value.performedByUserId}</td>
                    <td>{new Date(value.datetime).toDateString()} </td>
                    <td>{value.type} </td>
                    <td>{value.pictureId} </td>
                    <td>{value.accountId} </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </Table>
      )}
    </CustomAppShell>
  );
};

export default AdminHomePage;

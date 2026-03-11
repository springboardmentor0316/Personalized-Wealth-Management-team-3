import { useEffect, useState } from "react";
import api from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/profile")
      .then(res => setUser(res.data))
      .catch(() => alert("Not logged in"));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Risk: {user.risk_profile}</p>
    </div>
  );
}

import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const navigate = useNavigate();

const login = async () => {

if (!email || !password) {
alert("Enter email & password");
return;
}

try {

setLoading(true);

const params = new URLSearchParams();
params.append("username", email.trim());
params.append("password", password);

const res = await api.post("/auth/login", params);

localStorage.setItem("token", res.data.access_token);

navigate("/dashboard");

} catch (error) {

alert("Login failed");

} finally {

setLoading(false);

}

};


return (

<div style={{
display:"flex",
height:"100vh",
fontFamily:"Inter, sans-serif"
}}>


{/* LEFT SIDE */}

<div style={{
width:"50%",
background:"#c7d8e3",
display:"flex",
flexDirection:"column",
justifyContent:"center",
padding:"80px"
}}>

<h3 style={{marginBottom:"40px"}}>
Fin<span style={{color:"#2563eb"}}>Edge</span>
</h3>


<h1 style={{
fontSize:"42px",
fontWeight:"700",
lineHeight:"1.3",
maxWidth:"500px"
}}>

Build Your Financial Future

<br/>

<span style={{color:"#2563eb"}}>
With Smart Planning.
</span>

</h1>


<p style={{
marginTop:"20px",
color:"#555",
fontSize:"16px",
lineHeight:"1.6",
maxWidth:"420px"
}}>

Track investments, manage goals and grow wealth
with a modern intelligent platform.

</p>


<div style={{
background:"white",
padding:"14px",
marginTop:"40px",
width:"260px",
borderRadius:"8px",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
}}>
🔒 Secure Investment Tracking
</div>


<div style={{
background:"white",
padding:"14px",
marginTop:"18px",
width:"260px",
borderRadius:"8px",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
}}>
📊 Smart Risk Insights
</div>


<div style={{
background:"white",
padding:"14px",
marginTop:"18px",
width:"260px",
borderRadius:"8px",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
}}>
🎯 Goal Progress Monitoring
</div>


<p style={{
marginTop:"60px",
fontSize:"13px"
}}>
© 2026 FinEdge. All rights reserved.
</p>

</div>



{/* RIGHT SIDE */}

<div style={{
width:"50%",
background:"#f5f5f5",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}>


<div style={{width:"360px"}}>

<h2 style={{fontSize:"26px"}}>
Welcome back
</h2>


<p style={{
color:"#666",
fontSize:"14px",
marginTop:"8px"
}}>
Enter your credentials to access your dashboard
</p>


<p style={{marginTop:"25px",fontWeight:"500"}}>
Email Address
</p>


<input
type="email"
placeholder="name@example.com"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"1px solid #ddd",
marginTop:"6px"
}}
/>


<p style={{marginTop:"18px",fontWeight:"500"}}>
Password
</p>


<input
type="password"
placeholder="Enter your password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"1px solid #ddd",
marginTop:"6px"
}}
/>

<p
onClick={() => navigate("/forgot-password")}
style={{
marginTop:"8px",
color:"#2563eb",
cursor:"pointer",
fontSize:"14px"
}}
>
Forgot password?
</p>


<button
onClick={login}
style={{
width:"100%",
padding:"12px",
marginTop:"22px",
background:"#3b82f6",
color:"white",
border:"none",
borderRadius:"8px",
fontSize:"15px",
cursor:"pointer",
boxShadow:"0 4px 8px rgba(0,0,0,0.2)"
}}
>

{loading ? "Signing in..." : "Sign in"}

</button>


<p style={{
marginTop:"20px",
fontSize:"14px"
}}>

Don't have an account?

<span 
onClick={() => navigate("/register")}
style={{
color:"#2563eb",
marginLeft:"6px",
cursor:"pointer"
}}>
Create new account
</span>

</p>


</div>

</div>

</div>

);

}
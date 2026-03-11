import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const navigate = useNavigate();

const register = async () => {

if (!name || !email || !password) {
alert("Please fill all fields");
return;
}

try {

await api.post("/auth/register", {
name,
email,
password
});

alert("Account created successfully");

navigate("/login");

} catch (error) {

alert("Registration failed");

}

};

return (

<div style={{
display:"flex",
height:"100vh",
fontFamily:"Inter, sans-serif"
}}>

{/* LEFT SECTION */}

<div style={{
width:"50%",
background:"#c7d8e3",
display:"flex",
flexDirection:"column",
justifyContent:"center",
padding:"70px"
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

Start Managing Your Wealth

<br/>

<span style={{color:"#2563eb"}}>
Create Your Account.
</span>

</h1>

<p style={{
marginTop:"20px",
color:"#555",
fontSize:"16px",
lineHeight:"1.6",
maxWidth:"420px"
}}>

Join FinEdge and take control of your investments,
goals, and financial future.

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

</div>


{/* RIGHT SECTION */}

<div style={{
width:"50%",
background:"#f5f5f5",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}>

<div style={{width:"360px"}}>

<h2>Create Account</h2>

<p style={{color:"#666",fontSize:"14px"}}>
Register to start managing your wealth
</p>


<p style={{marginTop:"20px"}}>Full Name</p>

<input
type="text"
placeholder="Enter your name"
value={name}
onChange={(e)=>setName(e.target.value)}
style={{
width:"100%",
padding:"12px",
borderRadius:"8px",
border:"1px solid #ddd",
marginTop:"6px"
}}
/>


<p style={{marginTop:"18px"}}>Email</p>

<input
type="email"
placeholder="Enter email"
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


<p style={{marginTop:"18px"}}>Password</p>

<input
type="password"
placeholder="Create password"
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


<button
onClick={register}
style={{
width:"100%",
padding:"12px",
marginTop:"22px",
background:"#3b82f6",
color:"white",
border:"none",
borderRadius:"8px",
fontSize:"15px",
cursor:"pointer"
}}
>

Create Account

</button>


<p style={{marginTop:"20px",fontSize:"14px"}}>

Already have an account?

<span
onClick={() => navigate("/login")}
style={{
color:"#2563eb",
marginLeft:"6px",
cursor:"pointer"
}}
>
Login
</span>

</p>

</div>

</div>

</div>

);

}
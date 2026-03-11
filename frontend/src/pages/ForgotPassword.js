import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

const [email,setEmail] = useState("");
const navigate = useNavigate();

const resetPassword = () => {

if(!email){
alert("Enter email");
return;
}

alert("Password reset link sent to " + email);

};

return (

<div style={{
display:"flex",
height:"100vh",
fontFamily:"Inter"
}}>


{/* LEFT SIDE */}

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
fontSize:"40px",
fontWeight:"700"
}}>
Reset Your Password
</h1>

<p style={{
marginTop:"20px",
color:"#555",
maxWidth:"420px"
}}>
Enter your email and we will send you a link
to reset your password.
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

<h2>Reset Password</h2>

<p style={{color:"#666"}}>
Enter your email to reset password
</p>

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
marginTop:"20px"
}}
/>

<button
onClick={resetPassword}
style={{
width:"100%",
padding:"12px",
marginTop:"20px",
background:"#3b82f6",
color:"white",
border:"none",
borderRadius:"8px"
}}
>
Send Reset Link
</button>


<p style={{marginTop:"20px"}}>

Remember your password?

<span
onClick={() => navigate("/login")}
style={{color:"#2563eb",cursor:"pointer"}}
>
 Login
</span>

</p>

</div>

</div>

</div>

);

}
const express=require("express");
const path=require("path");
const app=express();
const mongoose=require("mongoose");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
//araay 
//const users=[]

//mongoose connection

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName: "backend",
}).then(()=>console.log("Database connected"))
  .catch((e)=>console.log("error"));

const userSchema=new mongoose.Schema({
    name: String,
    email: String,
    password:String,
    
});

const User= mongoose.model("User",userSchema);



//y ek trh ki middleware h 

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

//serving dynamic files
app.set("view engine","ejs");


const isAuthenticated=async(req,res,next)=>{
  const {token}=req.cookies;
  if(token){
    const decoded=jwt.verify(token,"sdfghjkl");
    
    req.user=await User.findById(decoded._id);
    next();
  }else{
    res.redirect("/login");
}
};

app.get("/",isAuthenticated,(req,res)=>{
   console.log(req.user);
  //res.render("index",{name: "Verma7jr"});
    res.render("logout",{name :req.user.name});
});

app.get("/register",(req,res)=>{
  res.render("register");
});

app.get("/login",(req,res)=>{
  res.render("login");
});


app.get("/logout",(req,res)=>{
  res.cookie("token",null,{
    httpOnly:true,
    expires:new Date(Date.now()),
  });
  res.redirect("/");
})

app.post("/register",async(req,res)=>{
  const {name,email,password}=req.body;
  let user=await User.findOne({email});
  if(user)
  {
   return res.redirect("/login");
  }
  const hashedPassword=await bcrypt.hash(password,10);
   user=await User.create({
    name,
    email,
    password:hashedPassword,
  });
  const token=jwt.sign({_id:user._id},"sdfghjkl");
  res.cookie("token",token,{
    httpOnly:true,
    expires: new Date(Date.now()+60*1000)
  });
  res.redirect("/");
})


app.post("/login",async(req,res)=>{
  const {email,password}=req.body;
  
  let user= await User.findOne({email});
  if(!user) return res.redirect("/register");

  const isMatch=await bcrypt.compare(password,user.password);
  if(!isMatch) return res.render("login",{email,message : "Incorrect Password"});
  const token=jwt.sign({_id:user._id},"sdfghjkl");
  res.cookie("token",token,{
    httpOnly:true,
    expires: new Date(Date.now()+60*1000)
  });
  res.redirect("/");
})


// app.get("/success",(req,res)=>{
//    res.render("success");
// })
// app.post("/contact",async(req,res)=>{
//     console.log(req.body);
//     //users.push({username: req.body.name,email: req.body.email});
//     const {name,email}=req.body;
//     await Messge.create({name,email});
//     res.redirect("/success");
// })

app.listen(8000,()=>{
    console.log("Server is working");
})
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
// import express from "express";
// import mysql from 'mysql';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import jwt from 'jsonwebtoken';


const app = express()


app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
    origin: ["http://localhost:5173"],
    method: ["POST , GET"],
    credentials: true
    }
))


const db= mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:"signup"
})

const verifyUser = (req, res, next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.json({Message: "provide token"})
    }
    else{
        jwt.verify(token, "our jwt token key" , (err, decoded) => {
            if(err){
                return res.json({Message: "Authentication Error"})
            }
            else{
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/', verifyUser, (req,res) => {
    return res.json({Status: "Success" , name: req.name})
})

app.post('/login', (req, res)=>{
    const sql = "SELECT * FROM login WHERE id = ? AND password = ?"
    // const values = [
    //     req.body.id,
    //     req.body.password
    // ]
    db.query(sql, [ req.body.id,  req.body.password], (err, data) => {
        if(err) return res.json("Error");
        if(data.length > 0)
        {
            // return res.json('login successfully')
            const name = data[0].name;
            const token = jwt.sign({name} , "our jwt token key" , {expiresIn: '1d'});
            res.cookie('token' , token);
            return res.json({Status: "Success"});
        }
        else{
            return res.json({Message: "No records"})
        }
    })

})


app.get('/logout', (req,res) => {
    res.clearCookie('token');
    return res.json({Status: "Success"});

})




app.post('/signup', (req, res)=>{
    const sql = "INSERT INTO login (`name` , `gender` , `date` , `email` , `id` , `po` , `password`) VALUES (?)";

const values = [
    req.body.name,
    req.body.gender,
    req.body.date,
    req.body.email,
    req.body.id,
    req.body.po,
    req.body.password,
]
db.query(sql, [values], (err, data) =>{
    if(err)
    {
        return res.json("Error");
    }
    return res.json(data);
})
})


app.get('/', (re,res)=> {
    return res.json("From backend side");
})

app.listen(8081, ()=>{
    console.log("running");
})
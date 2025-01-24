"use client";
import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/utilities/useLocalStorage";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Box,
  Button,
  Grid,
  Input,
  Link,
  Typography,
} from "@mui/material";
import appTheme from "@/theme.js";
import { ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/Hooks";


function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://intn.city/">
        INTNCITY
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const EmailLogin = ({ setFlag }) => {
  const auth = useAuth();
  const navigate = useRouter().push;
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(null);
  const [email, setEmail] = useState("");

  const EmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

  useEffect(() => {
    if(connected != null && !connected) {
      const t = {
        name: null,
        category: null,
        longitude: null,
        latitude: null,
        questions: null,
        images: null,
        address: null,
      };
    }
  }, [connected]);

  useEffect(() => {
    if (auth) {
      setConnected(auth.connected);
    }
    if (auth.user) {
      setUser(auth.user);
      setConnected(auth.connected);
    }
  }, [auth]);



  // useEffect(() => {
  //   console.log(auth)
  //   console.log(connected)
  // }, [connected])

  return (
      <form 
        style={{display: "grid", gridTemplateRows: "1fr 1fr", width: "100%", textAlign: "center" }}
        onSubmit={(e) => {
          e.preventDefault()
          if (EmailRegex.test(email)) {
            setFlag()
            auth.Login("emailpasswordless", email)
          } else {
            setFlag("Invalid email.")
          }
        }}  
      >
        <Input 
          sx={{
            width: "100%",
            borderColor: "whitesmoke",
            borderRadius: "5px",
            borderWidth: "1px",
            borderStyle: "solid",
            padding: "5px",
            marginTop: "10px",
            marginBottom: "10px",
            textAlign: "center"
          }}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
          }}
          placeholder="example@intn.city"
        />
        <Button
          color="secondary"
          type="submit"
          size="large"
          variant="contained"
          sx={{
            borderRadius: "5px",
            width: "150px",
            height: "50px",
            marginLeft: "calc(50% - 75px)"
          }}
        >
          Send Code
        </Button>
      </form>
  );
};

export default function LoginPage() {  
  let navigate = useRouter().push;
  const auth = useAuth();
  const [flag, setFlag] = useState();


  const handleSubmit = (event) => {
    event.preventDefault();

    // Force application state reset
    localStorage.setItem("appStep", 0);

    navigate("/plant");
  };

  return (
    <ThemeProvider theme={appTheme}>
      <Grid 
        container
        sx={{ height: "100vh" }}
        >
        {/*  Left Column - Background Image */}

        <Grid
          item
          xs={true}
          sm={false}
          md={4}
          sx={{
            backgroundImage:
              "url(http://intn.city/wp-content/uploads/2021/09/Intensity-cover.jpg)", //url("http://intn.city/wp-content/uploads/2021/09/Intensity-cover.jpg")
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/*  Right Column - Text Field */}

        <CssBaseline />
        <Grid item xs={12} sm={12} md={8} sx={{height: "100vh"}}>
          <Button 
            color="secondary" 
            size="large" 
            type="button" 
            variant="contained"
            onClick={() => {
                navigate("/")
            }}
            sx={{
                borderRadius: "0 0 5px 0"
            }}
          >
            Back
          </Button>
          <Box
            sx={{
              my: 8,
              mx: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "70vh",
              paddingTop: "20vh"
            }}
          >
            <Typography variant="h6" fontWeight={"bold"}>Enter your email address:</Typography>
              <Grid item align="right" color="transparent">
                <EmailLogin setFlag={setFlag} />
              </Grid>
              {flag && <Typography color="error">{flag}</Typography>}
          </Box>
          <Copyright />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
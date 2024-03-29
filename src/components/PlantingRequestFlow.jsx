import React, {useEffect, useState} from 'react';
import {
  Button,
  Box,
  Container,
  Fab,
  Grid,
  Link,
  Paper,
  Step,
  Stepper,  
  StepLabel,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from "./utilities/useLocalStorage";
import { createTreePlantingRequest, PlantingRequest } from '../api/airtable';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import TreeAttributesForm from './Step1TreeAttributes';
import LocationForm from './Step2Location';
import Review from './Step3Review';
import ImageCarousel from './ImageCarousel';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://intn.city/">
      INTNCITY
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const steps = ['Tree species', 'Location details', 'Review your request'];

const theme = createTheme();

// 1247 80th Ave., Oakland, CA 37.755443, -122.184389
const EAST_OAKLAND = {lat: 37.755443,lng: -122.184389};


export default function PlantingRequestForm() {
  const navigate = useNavigate();   
  const [activeStep, setActiveStep] = useLocalStorage("appStep", 0);  
  const [email] = useLocalStorage("email", "");  
  const [images, setImages] = useLocalStorage("images", []);
  const [appId, setAppId] = useLocalStorage("appUuid", "");
  const [tree, setTree] = useLocalStorage("tree", false);
  const [currentLocation, setCurrentLocation] = useLocalStorage("location", EAST_OAKLAND);
  const [currentAddress, setCurrentAddress] = useLocalStorage("address", "");  
  const [complyAppropriateSpecies, setComplyAppropriateSpecies] = useLocalStorage("complyAppropriateSpecies", false);
  const [complyMinContainerSize, setComplyMinContainerSize] = useLocalStorage("complyMinContainerSize", false);
  const [complyWithStandard, setComplyWithStandard] = useLocalStorage("complyWithStandard", false);
  const [validated, setValidated] = React.useState(validateForm());

  useEffect(() => {
    setValidated(validateForm);
 }, [complyAppropriateSpecies, complyMinContainerSize, complyWithStandard, tree]);

  function getStepContent(step) {
    // console.log("Load wizard forms");
    switch (step) {
      case 0:
        return <TreeAttributesForm 
                  tree={tree}
                  complyAppropriateSpecies={complyAppropriateSpecies}
                  complyMinContainerSize={complyMinContainerSize}
                  complyWithStandard={complyWithStandard}
                  handleAttributesChanged={onHandleAttributesChanged}/>;
      case 1:
        return <LocationForm 
                  currentLocation={currentLocation}
                  currentAddress={currentAddress}
                  handleLocationChanged={onHandleLocationChanged}/>;
      case 2:
        return <Review />;
      default:
        throw new Error('Unknown step');
    }
  }

  function validateForm() {
    return (complyAppropriateSpecies 
      && complyMinContainerSize 
      && complyWithStandard
      && tree != "");
  }

  function onHandleLocationChanged(address, loc) {
    setCurrentAddress(address);
    setCurrentLocation(loc);
  }

  function onHandleAttributesChanged(key, value) {
    if (key === "complyAppropriateSpecies") {
      setComplyAppropriateSpecies(value);
      console.log("complyAppropriateSpecies = ", value);      
    }

    if (key === "complyMinContainerSize") {
      setComplyMinContainerSize(value);
      console.log("setComplyMinContainerSize = ", value);      
    }

    if (key === "complyWithStandard") {
      setComplyWithStandard(value);    
      console.log("setComplyWithStandard = ", value);      
    }

    if (key === "tree") {
      setTree(value);    
      console.log("tree = ", value.name);      
    }
  }

  const handleNext = async () => {
    setActiveStep(activeStep + 1);

    // final step of the application process, time to submit
    if (activeStep === steps.length - 1) {
      let address = localStorage.getItem("address");
      if (address && address != "undefined") {
        address = JSON.parse(address);
      }
      let tree = localStorage.getItem("tree");
      if (tree && tree != "undefined") {
        tree = JSON.parse(tree);
      }            
      let location = localStorage.getItem("location");  
      if (location && location != "undefined") {
        location = JSON.parse(location);
      }
      let images = localStorage.getItem("images");
      if (images && images != "undefined") {
        images = JSON.parse(images);
      }
      let questions = localStorage.getItem("notes");
      if (questions && questions != "undefined") {
        questions = JSON.parse(questions);
      }

      let pr: PlantingRequest = {
        email: email,
        address: address,
        latitude: location.lat,
        longitude: location.lng,
        treeid: tree.id,
        quantity: 1,
        questions: questions,
        images: images
      };
      console.log("Tree request: " + JSON.stringify(pr));

      // Create request in Airtable
      let requestId = await createTreePlantingRequest(pr);

      // Send confirmation email
      const shortId = requestId.slice(0, 4);
      const url = "/api/send-email?" + new URLSearchParams({
        to: email,
        app_id: shortId,
      });

      console.log("Sending email using URL: " + url);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const result = await response.json();
      console.log("Email result: " + JSON.stringify(result));
    
      setAppId(requestId);
    }    
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleNewTreeRequest = (event) => {
    event.preventDefault();

    // Force application state reset
    setImages("");
    setActiveStep(0);
    setComplyAppropriateSpecies(false);
    setComplyMinContainerSize(false);
    setComplyWithStandard(false);
    setCurrentAddress("");
    setCurrentLocation(EAST_OAKLAND);

    navigate('/app');
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <React.Fragment>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Typography variant="h6">
                Your application number is #{appId.slice(0, 4)}. We have emailed your application
                confirmation, and will send you an update when your permit has been approved.
              </Typography>
              <Box m={1} display="flex" justifyContent="center" alignItems="center">
                <Button 
                    onClick={handleNewTreeRequest}
                    variant="contained" 
                    color="secondary"
                    sx={{width: 200, mt: 4}}>
                      Plant another Tree
                  </Button>    
              </Box>
              <ImageCarousel sx={{width: "800px"}}/>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}
                <Fab
                  size="medium" 
                  color="primary" 
                  aria-label="next"
                  variant="extended"
                  onClick={handleNext}
                  disabled={!validated}
                  sx={{ mt: 3, px: 4 }}
                >
                  {activeStep === steps.length - 1 ? 'Submit Application' : 'Next'}
                </Fab>
              </Box>
            </React.Fragment>
          )}
        </React.Fragment>
      </Paper>
      <Copyright />
    </Container>

  );
}
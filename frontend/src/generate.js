import React, {useState} from "react";
import ImageUploadAndShowResult from "./components/ImageUploadAndShowResult";
import "./HomeStyle.css"
import image from './asset/density_plot.png'
import axios from "axios";

export const Generate = () => {

    // const [densityPlotSrc, setDensityPlotSrc] = useState(null);
    const [buttonClicked, setButtonClicked] = useState(false);


  
    const generateDensityPlot = async (e) => {
      e.preventDefault(); 

      try {
        console.log("Hi")
         const response = await axios.get("http://localhost:8001/plot_density");
         console.log(response)
         setButtonClicked(true)
        // if (response.ok) {
        //   const { imagePath } = await response.json();
        //   // setDensityPlotSrc(imagePath);
        //   // setButtonClicked(true);
        // // } 
        // else {
        //   console.error("Failed to generate density plot");
        // }
      } catch (error) {
        console.error("Error fetching density plot", error);
      }
    };
    console.log("Hello everyone")
    return (
      <>
      <div className="button-container">
        <button type="button" onClick={generateDensityPlot}>Generate Heatmap</button>
        {buttonClicked && (
        <img src ={image} alt="Density Plot" width={800} height={700}/>
       )}  
      </div>
    </>
  );
};
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
from fastapi import HTTPException
from matplotlib.patches import Patch
from matplotlib.lines import Line2D


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = tf.keras.models.load_model("C:/Users/rajen/OneDrive/Documents/fastapitfserving/potato-disease-classification/saved_models/CNN_potato_M.h5")

CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

# Define a list to store the results
results_list = []
@app.get("/ping")
async def ping():
    return "Hello, I am alive"

def read_file_as_image(data, target_size=(256, 256)) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)).resize(target_size))
    return image

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    
    predictions = MODEL.predict(img_batch)

    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    
    # Append results to the list
    results_list.append({
        'class': predicted_class,
        'confidence': confidence
    })
    def result(predicted_class, confidence):
        if confidence < 0.9:
            value = {'class': 'Class can not be recognized',
            'confidence': float(confidence)}
        else:
            value = {'class': predicted_class,
        'confidence': float(confidence)}
            
        return value
        
    print(results_list)
    res =  result(predicted_class=predicted_class,confidence=confidence)
    print(res)
    return res

@app.get("/plot_density")
async def plot_density():
    try:
        field_width = 100  # meters
        field_height = 100  # meters

        # Define colors for each class
        class_colors = {'Early Blight': 'yellow', 'Healthy': 'green', 'Late Blight': 'red'}

        # Create a new figure for each call to plot_density()
        plt.figure(figsize=(13, 13))

        # Define the number of rows and columns in the grid
        rows = 4
        cols = 4

        # Calculate the step size for distributing the points within the grid
        step_x = field_width / cols
        step_y = field_height / rows

        # Counter for tracking the number of plotted points
        point_counter = 0

        # Create lists to store legend handles and labels
        legend_handles = []
        legend_labels = []

        # Iterate through the 4x4 grid
        for row in range(rows):
            for col in range(cols):
                # Check if there are remaining points to plot
                if point_counter < len(results_list):
                    # Get the class and confidence from results_list
                    data = results_list[point_counter]
                    class_name = data['class']
                    confidence = data['confidence']

                    # Calculate the coordinates for the current point
                    # Starting from bottom-left corner and increasing from left to right
                    x_coord = col * step_x
                    y_coord = (rows - row - 1) * step_y

                    # Plot the point with the corresponding class color
                    plt.fill([x_coord, x_coord + step_x, x_coord + step_x, x_coord],
                             [y_coord, y_coord, y_coord + step_y, y_coord + step_y],
                             color=class_colors[class_name], alpha=confidence)
                    

                    # Increment the point counter
                    point_counter += 1

                    # Add class name and color to legend lists
                    if class_name not in legend_labels:
                        legend_handles.append(Patch(facecolor=class_colors[class_name], label=class_name))
                        legend_labels.append(class_name)

        # Customize the plot
        plt.title("Heatmap of Predicted Classes Confidence Over 4x4 Grid")
        plt.xlabel("X-coordinate (m)")
        plt.ylabel("Y-coordinate (m)")
        plt.grid(True)
        plt.xlim(0, field_width)
        plt.ylim(0, field_height)
        plt.gca().set_aspect('equal', adjustable='box')

        # Create legend outside the plot
        plt.legend(handles=legend_handles, labels=legend_labels, loc='upper left', bbox_to_anchor=(1, 1))

        # Specify the desired file path
        save_path = "C:/Users/rajen/OneDrive/Documents/fastapitfserving/potato-disease-classification/frontend/src/asset/density_plot.png"

        # Save the plot to the specified path
        plt.savefig(save_path)
        plt.close()  # Close the plot to free memory

        results_list.clear()

        # Return the path to the saved image
        return {"imagePath": save_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8001)
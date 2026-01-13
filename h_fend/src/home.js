import React, { useRef, useState } from "react";
import CanvasDraw from 'react-canvas-draw';


const Home = () => {

    const canvasref = useRef(null);
    const [prediction, setPrediction] = useState(null);

    const clearCanvas = () => {
        canvasref.current.clear();
        setPrediction(null);
    }

    const predictDigit = async () => {
        const imageData = canvasref.current.getDataURL();

        try {
            const response = await fetch('http://localhost:3000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageData }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            // Assuming the backend returns { prediction: <digit> }
            setPrediction(data.prediction);
        } catch (error) {
            console.error('Error predicting digit:', error);
            alert('Failed to get prediction. Check console for details.');
        }
    }


    return (
        <div className="home">

            <header className="head">HAND-DIGIT RECOGNITION</header>

            <div className="work-space">

                <div className="draw-frame">
                    <h1>Draw a digit</h1>
                    <CanvasDraw

                        ref={canvasref}
                        brushColor="black"
                        backgroundColor="#ffffff"
                        canvasWidth={280}
                        canvasHeight={280}

                        hideGrid={false}
                        gridColor="#797777ff"     // 👈 light grid
                        gridSize={10}

                        brushRadius={4}
                        lazyRadius={0}

                    />
                    <div className="btns">
                        <button className="clear" onClick={clearCanvas}>CLEAR</button>
                        <button className="predict" onClick={predictDigit}>PREDICT</button>
                    </div>

                </div>

                <div className="result-space">
                    <h1>Prediction</h1>
                    <div className="dis">
                        <p>{prediction !== null ? prediction : '-'}</p>
                    </div>

                </div>


            </div>

        </div>
    );
}

export default Home;
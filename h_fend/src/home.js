import React, { useRef } from "react";
import CanvasDraw from 'react-canvas-draw';


const Home = () => {

    const canvasref = useRef(null);

    const clearCanvas = () => {
        canvasref.current.clear();
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
                        <button className="predict">PREDICT</button>
                    </div>
                    
                </div>

                <div className="result-space">
                    <h1>Prediction</h1>
                    <div className="dis">
                        <p>9</p>
                    </div>

                </div>


            </div>

        </div>
    );
}
 
export default Home;
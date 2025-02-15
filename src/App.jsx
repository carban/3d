import { useState } from 'react'
import './App.css'
import { Viewer, Entity } from "resium";
import { Cartesian3, Color, Ion } from "cesium";
import dataYears from "./json_data.json"
import geometries from "./geometries.json"

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM;

// const url = "https://fooapi.com/api/countries";
// let countries = [];
// try {
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(`Response status: ${response.status}`);
//   }
//   const json = await response.json();
//   let features = json.data.features;
//   let aaa = [Color.YELLOWGREEN, Color.RED, Color.BLUEVIOLET, Color.ALICEBLUE];
//   for (let f of features) {
//     if (f.id != "-99"){
//       for (let i = 0; i < f.geometry.coordinates.length; i++) {
//         const flattened = f.geometry.coordinates[i].flat(Infinity)
//         // console.log("===>>>", flattened)
//         let xyz = Math.floor(Math.random() * aaa.length);
//         let ccc = aaa[xyz];
//         let obj = {
//           id: f.id+"_"+i,
//           name: f.properties.name,
//           polygon: {
//             hierarchy: flattened,
//             material: Color.CHOCOLATE,
//             extrudedHeight: 100000,
//             displayedHeight: 100000
//           },
//         }
//         countries.push(obj)
//       }
//     }
//   }
// } catch (error) {
//   console.error(error.message);
// }

// console.log(countries)

function App() {
  const [year, setYear] = useState(0)
  const [countries, setCountries] = useState(geometries)
  
  function numberToColor(value) {
    const minVal = 0;
    const maxVal = 8000000;
    
    // Clamp value within the range
    value = Math.max(minVal, Math.min(maxVal, value));
    
    // Normalize value to range [0, 1]
    const normalized = (value - minVal) / (maxVal - minVal);
    
    // Convert normalized value to hue (0° to 270° for rainbow spectrum)
    const hue = (1 - normalized) * 270; 
    
    // Convert HSL to RGB
    const rgb = hslToRgb(hue / 360, 1, 0.5);
    
    return {
        red: rgb[0] / 255,
        green: rgb[1] / 255,
        blue: rgb[2] / 255,
        alpha: 1
    };
}

function hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // Achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

  function handleClick(vvv) {
    console.log(vvv)
    setYear(vvv)
    let dataFromYear = dataYears[year];
    let a = [Color.CHOCOLATE, Color.RED, Color.AQUAMARINE, Color.BEIGE, Color.CRIMSON];
    // Create a new array to trigger re-render
    let updatedCountries = countries.map(c => {
      let y = dataFromYear[c.id.split("_")[0]]
      let v = y / 150 || 0
      let {red, green, blue} = numberToColor(v)
      let newColor = new Color(red, green, blue, 0.7)
      return {
      ...c,
      polygon: {
        ...c.polygon,
        extrudedHeight: v,
        displayedHeight: y,
        material: newColor
      }
    }});
  
    setCountries(updatedCountries);
  }
  return <div>
      <Viewer full width="100" className='map' resolutionScale={0.7} fullscreenButton={false} timeline={false} animation={false}>
        {
          countries.map(c => (
            <Entity key={c.id} polygon={{
              hierarchy: {
                positions: Cartesian3.fromDegreesArray(c.polygon.hierarchy),
              },
              extrudedHeight: c.polygon.extrudedHeight,
              material: new Color(c.polygon.material.red, c.polygon.material.green, c.polygon.material.blue, c.polygon.material.alpha), // Change color in height function
              // material: Color.CHOCOLATE
            }}
            name={c.name} description={c.polygon.displayedHeight == 100000 ? "Population: 0 (Select a year)" : "Population: "+c.polygon.displayedHeight} />
            )
            )
          }
      </Viewer>
    <div className="rightMenu">
      <h1>3D Data World</h1>
      <p>
        This project aims to show you different kind of information about the world in a 3D map (Just population for now)
      </p>
      <p>Data scraped from: <a href="https://fooapi.com">fooapi.com</a> and <a href="https://ourworldindata.org/">ourworldindata.org</a></p>
      <hr  style={{width: "90%"}} />
      <h1>Population</h1>
      <h2>{year == 0 ? "Drag the slider" : "In "+year}</h2>
        <input type="range" min="1900" max="2023" id="myRange" style={{width: "75%"}}
        onChange={e => handleClick(e.target.value)} onClick={e => handleClick(e.target.value)}/>
      </div>
  </div> 
}

export default App

//dependencies
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { GridLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import mapStyles from './mapstyles';

//data
const srcData = './fatalityData.json';

//--------------------------------------------------------
console.log(process.env.API_KEY);

// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=' + process.env.API_KEY + '&callback=initMap';
script.defer = true;

// Attach your callback function to the `window` object
window.initMap = function() {
  // JS API is loaded and available
};

// Append the 'script' element to 'head'
document.head.appendChild(script);

//--------------------------------------------------------

//function to return # of data points within a square to influence height/colour
function getCount(points) {
  return points.length;
}

//defines the base layer; a dot per data point
const scatterplot = () => new ScatterplotLayer({
    id: 'scatterplot',
    data: srcData,
    opacity: 0.5,
    filled: true,
    radiusMinPixels: 3,
    radiusMaxPixels: 4,
    getPosition: d => [d.longitude, d.latitude],
    getFillColor: [255, 0, 0, 100],
    pickable: true,
    
    //defines information displayed whilst hovering
    onHover: ({object, x, y, z, a, b, c}) =>{
        const el = document.getElementById('tooltip');
        if(object){
            const {uniqueID, newsLink, subjectName, subjectAge, address, description, subjectRace} = object;
            el.innerHTML = `<h3>Name: ${subjectName}, ${subjectAge}</h3>
                            <h3>Race: ${subjectRace}</h3>
                            <h3>Location: ${address}</h3>
                            <h3>Description: ${description}</h3>
                            <h3>FE ID: ${uniqueID}</h3>`
            el.style.display = 'block';
            el.style.opacity = 0.8;
            el.style.left = x + 'px';
            el.style.top = y + 'px';
        }
        else{
            el.style.opacity = 0.0;
        }
    },
    
    //on click, redirects to URL given by dataset
    onClick: ({object, x, y}) =>{
        if(object.newsLink){ window.open(object.newsLink); }
        else{ window.open('https://fatalencounters.org/'); }
    },
});

//defines secondary layer as a heatmap, deck.gl prebuilt assets allow the heatmap to behave according to it's proximity to other data points
const heatmap = () => new HeatmapLayer({
    id: 'heat',
    data: srcData,
    opacity: 0.5,
    getPosition: d => [d.longitude, d.latitude],
    radiusPixels: 35,
});

//defines tertiary layer as an extruding grid layer, height/colour depends on points it encloses, given by first function
const grid = () => new GridLayer({
    id: 'grid',
    data: srcData,
    extruded: true,
    cellSize: 8000,
    elevationScale: 1000,
    coverage: 0.88,
    opacity: 0.5,
    getElevationValue: getCount,
    getPosition: d => [d.longitude, d.latitude]
  });

window.initMap = () => {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.0, lng: -100.0},
        zoom: 5,
        styles: mapStyles
    });

    const overlay = new GoogleMapsOverlay({
        layers: [
            scatterplot(),
            heatmap(),
            grid(),
        ],
    });

    overlay.setMap(map);
    
}
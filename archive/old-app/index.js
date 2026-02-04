// Irregular Verbs Data - Global Object

// Create a simple script that directly creates the irregularVerbsData object
// and waits for the DOM to load before populating it from the globals

// Create the empty object that will hold all stages
window.irregularVerbsData = {};

// Function to run after DOM is loaded to ensure all stage files are loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Loading irregular verb data from individual stage files");
    
    // Set up listeners to wait for late-loading resources
    setTimeout(function() {
        // Now populate the object with all stages
        if (window.irregularVerbStage1) {
            window.irregularVerbsData['irregularVerbStage1'] = window.irregularVerbStage1;
            console.log("Stage 1 loaded with " + window.irregularVerbStage1.length + " items");
        } else {
            console.error("irregularVerbStage1 is not defined");
        }
        
        if (window.irregularVerbStage2) {
            window.irregularVerbsData['irregularVerbStage2'] = window.irregularVerbStage2;
            console.log("Stage 2 loaded with " + window.irregularVerbStage2.length + " items");
        } else {
            console.error("irregularVerbStage2 is not defined");
        }
        
        if (window.irregularVerbStage3) {
            window.irregularVerbsData['irregularVerbStage3'] = window.irregularVerbStage3;
            console.log("Stage 3 loaded with " + window.irregularVerbStage3.length + " items");
        } else {
            console.error("irregularVerbStage3 is not defined");
        }
        
        if (window.irregularVerbStage4) {
            window.irregularVerbsData['irregularVerbStage4'] = window.irregularVerbStage4;
            console.log("Stage 4 loaded with " + window.irregularVerbStage4.length + " items");
        } else {
            console.error("irregularVerbStage4 is not defined");
        }
        
        if (window.irregularVerbStage5) {
            window.irregularVerbsData['irregularVerbStage5'] = window.irregularVerbStage5;
            console.log("Stage 5 loaded with " + window.irregularVerbStage5.length + " items");
        } else {
            console.error("irregularVerbStage5 is not defined");
        }
        
        // Log the object structure
        console.log("irregularVerbsData keys:", Object.keys(window.irregularVerbsData));
        console.log("irregularVerbsData contents:", window.irregularVerbsData);
    }, 100); // Small delay to ensure all scripts have loaded
}); 
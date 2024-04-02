import { Viewer, ControlPanel } from './components.js';

let METADATA = await fetch(`metadata.json`).then(response => response.json());
// Sort the metadata by slide id
// METADATA.sort((a, b) => a.id - b.id);

// Initialize control panel
let controller = new ControlPanel('control-panel', METADATA);

// Initialize viewer
let viewer = new Viewer('div-viewer', METADATA, 'https://storage.googleapis.com/tox-discovery/');
// let viewer = new Viewer('div-viewer', METADATA, 'data/slides/tox2data/');

// Load data
controller.update(controller.dropdown.value)
viewer.loadSlide(controller.dropdown.value);

// Activate control panel
controller.control([viewer]);

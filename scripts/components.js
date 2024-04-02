// Create Viewer class
export class Viewer {
    constructor(container_id, metadata, root_dir) {
        // Store metadata
        this.metadata = metadata;
        this.root_dir = root_dir;

        // Initialize container
        this.container = document.getElementById(container_id);

        // Initialize OpenSeaDragon viewer
        this.viewer = OpenSeadragon({
            id: container_id,
            prefixUrl: "scripts/openseadragon-bin-4.0.0/images/",
            zoomPerScroll: 2.0,
            maxZoomLevel: 100,
        });

        // Initialize map of open heatmaps
        window.open_heatmaps = {};

        // Get loading overlay
        this.loading_overlay = document.getElementById('div-loading-overlay');
    }

    // Load tissue
    async loadSlide(slide_id) {
        // Display loading overlay
        this.loading_overlay.style.display = "flex";

        // Store slide id
        this.slide_id = slide_id;

        // Update the OpenSeaDragon viewer
        this.viewer.open(this.root_dir + this.slide_id + "/" + this.slide_id + ".dzi");

        // Hide loading overlay when the slide is finished loading
        this.loading_overlay.style.display = "none";
    }

    // Show heatmap
    async loadHeatmap(lesion) {
        console.log('Showing heatmap for', this.slide_id)
        // Move loading overlay to front
        this.loading_overlay.style.zIndex = 1;

        // Display loading overlay
        this.loading_overlay.style.display = "flex";
        let loading_overlay = this.loading_overlay;

        console.log('Showing heatmap for', this.root_dir + this.slide_id + '/heatmaps' + this.metadata.find(slide => slide.id === this.slide_id).heatmaps[lesion])

        // Show heatmap
        this.viewer.addTiledImage({
            tileSource: {
                type: 'image',
                url: this.root_dir + this.slide_id + '/heatmaps/' + this.metadata.find(slide => slide.id === this.slide_id).heatmaps[lesion],
                buildPyramid: false,
            },
            opacity: 0.5, // Adjust as necessary
            success: function (event) {
                window.open_heatmaps[lesion] = event.item;
                // Hide loading overlay after a short delay
                setTimeout(function () {
                    loading_overlay.style.display = "none";
                }, 500);
            },
        });

    }

    // Hide heatmap
    removeHeatmap(lesion) {
        if (window.open_heatmaps[lesion]) {
            this.viewer.world.removeItem(window.open_heatmaps[lesion]);
            delete window.open_heatmaps[lesion];
        }
    }
}

// Create ControlPanel class
export class ControlPanel {
    constructor(panel_id, metadata) {
        // Initialize panel
        this.panel = document.getElementById(panel_id);

        // Load metadata
        this.metadata = metadata;

        // Create div for logo and link
        let logo_div_top = document.createElement('div');
        logo_div_top.classList.add('div-logo-top'); // add class

        // Add logo.png
        let logo_lab = document.createElement('img');
        logo_lab.src = 'logos/mahmoodlab.png';
        logo_lab.classList.add('logos-fullwidth'); // add class
        logo_lab.style.width = '220px'; 
        logo_div_top.style.display = 'flex';
        logo_div_top.style.justifyContent = 'center'; // Center horizontally
        logo_div_top.appendChild(logo_lab);

        // Append the top logo div to the panel
        this.panel.appendChild(logo_div_top);

        // Add dropdown
        this.dropdown = document.getElementById('slide-select');
        this.metadata.forEach(slide => {
            let option = document.createElement('option');
            option.value = slide.id;
            option.textContent = 'Slide ' + slide.id;
            this.dropdown.appendChild(option);
        });
        this.panel.appendChild(this.dropdown);

        // Initialize Select2
        $(this.dropdown).select2();

        // Add panel toggle
        this.button = document.getElementById('panel-toggle');
        this.button.addEventListener('click', () => {
            // Change the text of the button
            if (this.panel.classList.contains('show')) {
                this.button.innerHTML = '>>';
                this.button.style.transform = 'translateY(-50%) translateX(-500px)'; /* move the button 300px right */
            } else {
                this.button.innerHTML = '<<';
                this.button.style.transform = 'translateY(-50%) translateX(0)'; /* move the button back to the start */
            }
            this.panel.classList.toggle('show');
        });

        // Move panel to front
        this.panel.style.zIndex = 1;

        // Initialize map to store heatmap toggles
        this.heatmap_toggles = {};

    }


    // Update panel
    update(slide_id) {

        // Get slide data
        let slide_data = this.metadata.find(slide => slide.id === slide_id);

        // Clear panel
        while (this.panel.children.length > 3) {
            this.panel.removeChild(this.panel.lastChild);
        }

        // Context text: goal
        var goalText = document.createElement('div');
        goalText.innerHTML = '<strong>Jump inside our morphomolecular discovery pipeline!</strong>';
        goalText.style.display = 'flex';
        goalText.style.justifyContent = 'center'; // Center horizontally
        this.panel.appendChild(goalText);

        // Context text: description
        let descriptionText = document.createElement('div');
        descriptionText.innerHTML = '<em>Interact with both panels to visualize how pseudo-spatially-resolved expression align with the presence of morphological lesions.</em>';
        this.panel.appendChild(descriptionText);
    

        // Create a table to display the lesion and its heatmap
        var lesion_table = document.createElement('table');
        var labelRow = document.createElement('tr');

        var nameHeader = document.createElement('th');
        nameHeader.textContent = 'Lesion';
        labelRow.appendChild(nameHeader);

        var toggleHeader = document.createElement('th');
        toggleHeader.textContent = 'Heatmap';
        labelRow.appendChild(toggleHeader);

        lesion_table.appendChild(labelRow);

        // Show Lesion heatmaps
        Object.entries(slide_data.measured).forEach(([lesion, _]) => {

            if (lesion == 'Necrosis' || lesion == 'Cellular infiltration' || lesion == 'Fatty change' || lesion == 'Increased mitosis' || lesion == 'Hypertrophy' || lesion == 'ile duct proliferation') {

                var row = document.createElement('tr');

                var nameCell = document.createElement('td');
                nameCell.textContent = lesion;

                var toggleCell = document.createElement('td');

                var toggle = document.createElement('label');
                toggle.className = 'switch';

                var input = document.createElement('input');
                input.type = 'checkbox';
                this.heatmap_toggles[lesion] = input;

                var span = document.createElement('span');
                span.className = 'slider round';

                toggle.appendChild(input);
                toggle.appendChild(span);
                toggleCell.appendChild(toggle);
                row.appendChild(nameCell);
                row.appendChild(toggleCell);
                lesion_table.appendChild(row);
            }
        });
        this.panel.appendChild(lesion_table);

        // Context text: measured expression
        var lesionText = document.createElement('div');
        lesionText.innerHTML = '<strong>Lesion:</strong> Prediction of the lesion classifier (patch-level)';
        this.panel.appendChild(lesionText);
        
        // Create a table to display the lesions and their probabilities
        var expression_table = document.createElement('table');
        var labelRow = document.createElement('tr');
        var nameHeader = document.createElement('th');
        nameHeader.textContent = 'Gene';
        labelRow.appendChild(nameHeader);

        var measuredExpressionHeader = document.createElement('th');
        measuredExpressionHeader.textContent = 'Measured Expression';
        labelRow.appendChild(measuredExpressionHeader);

        var predictedExpressionHeader = document.createElement('th');
        predictedExpressionHeader.textContent = 'Predicted Expression';
        labelRow.appendChild(predictedExpressionHeader);

        var toggleHeader = document.createElement('th');
        toggleHeader.textContent = 'Heatmap';
        labelRow.appendChild(toggleHeader);

        expression_table.appendChild(labelRow);

        // Show all the Measured and Predicted expressions 
        Object.entries(slide_data.measured).forEach(([lesion, probability]) => {

            if (lesion != 'Necrosis' && lesion != 'Cellular infiltration' && lesion != 'Fatty change' && lesion != 'Increased mitosis' && lesion != 'Hypertrophy' && lesion != 'Bile duct proliferation') {

                var row = document.createElement('tr');

                var nameCell = document.createElement('td');
                nameCell.textContent = lesion;

                var measuredCell = document.createElement('td');
                measuredCell.textContent = probability;

                var predictedCell = document.createElement('td');
                predictedCell.textContent = slide_data.predicted[lesion];;

                var toggleCell = document.createElement('td');

                var toggle = document.createElement('label');
                toggle.className = 'switch';

                var input = document.createElement('input');
                input.type = 'checkbox';
                this.heatmap_toggles[lesion] = input;

                var span = document.createElement('span');
                span.className = 'slider round';

                toggle.appendChild(input);
                toggle.appendChild(span);
                toggleCell.appendChild(toggle);
                row.appendChild(nameCell);
                row.appendChild(measuredCell);
                row.appendChild(predictedCell);
                row.appendChild(toggleCell);
                expression_table.appendChild(row);
            }
        });
        this.panel.appendChild(expression_table);

        // Context text: measured expression
        var measuredExpressionText = document.createElement('div');
        measuredExpressionText.innerHTML = '<strong>Measured expression:</strong> Bulk log2 fold change gene expression';
        this.panel.appendChild(measuredExpressionText);

        // Context text: predicted expression
        var predictedExpressionText = document.createElement('div');
        predictedExpressionText.innerHTML = '<strong>Predicted expression:</strong> Slide-level log2 fold change predicted by GEESE';
        this.panel.appendChild(predictedExpressionText);

        // Context text: Attention
        var heatmapText = document.createElement('div');
        heatmapText.innerHTML = '<strong>Heatmap:</strong> Pseudo-spatially resolved gene expression map predicted by GEESE (<strong>red:</strong> Over/Under expression, <strong>blue:</strong> Normal expression)';
        this.panel.appendChild(heatmapText);
        
        // Create div for bottom logos
        let logo_div_bottom = document.createElement('div');
        logo_div_bottom.classList.add('div-logo-bottom'); // add class

        let logo_hms = document.createElement('img');
        logo_hms.src = 'logos/hms.png';
        logo_hms.classList.add('logos-fullwidth'); // add class
        logo_div_bottom.appendChild(logo_hms);

        let logo_bwh = document.createElement('img');
        logo_bwh.src = 'logos/mgb.svg';
        logo_bwh.classList.add('logos-fullwidth'); // add class
        logo_div_bottom.appendChild(logo_bwh);

        // Append the bottom logo div to the panel
        this.panel.appendChild(logo_div_bottom);
    }

    // Activate controller
    control(viewers) {
        // Update viewers and panel when dropdown changes
        $(this.dropdown).on('select2:select', (e) => {
            let selectedValue = e.params.data.id; // get selected slide ID from the event
            viewers.forEach(viewer => viewer.loadSlide(selectedValue));
            this.update(selectedValue);

            // Update heatmaps when toggle buttons are clicked
            Object.entries(this.heatmap_toggles).forEach(([lesion, toggle]) => {
                toggle.addEventListener('change', function () {
                    if (this.checked) {
                        viewers.forEach(viewer => viewer.loadHeatmap(lesion));
                    } else {
                        viewers.forEach(viewer => viewer.removeHeatmap(lesion));
                    }
                });
            });
        });


        // Update heatmaps when toggle buttons are clicked
        Object.entries(this.heatmap_toggles).forEach(([lesion, toggle]) => {
            toggle.addEventListener('change', function () {
                if (this.checked) {
                    viewers.forEach(viewer => viewer.loadHeatmap(lesion));
                } else {
                    viewers.forEach(viewer => viewer.removeHeatmap(lesion));
                }
            });
        });
    }
}

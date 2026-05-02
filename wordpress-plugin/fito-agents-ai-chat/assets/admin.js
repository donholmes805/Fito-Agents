jQuery(document).ready(function($) {
    // Basic interaction for the WordPress admin settings
    console.log('Fito Agents Admin Initialized');

    // Handle primary color change preview if needed
    $('#fito_primary_color').on('input', function() {
        var color = $(this).val();
        // Optional: Update some preview element
    });
});

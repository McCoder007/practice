// Add this script to your GitHub Pages site to check if Firebase Analytics is working
console.log('Checking Firebase Analytics setup...');

// Check if Firebase is loaded
if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase SDK is loaded');
    
    // Check if Analytics is initialized
    if (typeof firebase.analytics === 'function') {
        console.log('✅ Firebase Analytics is available');
        
        try {
            // Try to log a test event
            firebase.analytics().logEvent('test_event', { 
                test_param: 'This is a test event from check-analytics.js',
                timestamp: new Date().toISOString()
            });
            console.log('✅ Successfully logged test event to Firebase Analytics');
            
            // Check if the configuration has a measurementId
            if (firebase.app().options.measurementId) {
                console.log('✅ Firebase configuration has measurementId:', firebase.app().options.measurementId);
            } else {
                console.warn('⚠️ Firebase configuration is missing measurementId');
            }
        } catch (error) {
            console.error('❌ Error logging event to Firebase Analytics:', error);
        }
    } else {
        console.error('❌ Firebase Analytics is not available');
    }
} else {
    console.error('❌ Firebase SDK is not loaded');
}

// Instructions for checking:
console.log('\nTo check if Firebase Analytics is working:');
console.log('1. Open your GitHub Pages site: https://mccoder007.github.io/practice/');
console.log('2. Open browser developer tools (F12 or right-click > Inspect)');
console.log('3. Go to the Console tab');
console.log('4. Look for the check messages above');
console.log('5. If all checks pass, Firebase Analytics is properly set up'); 
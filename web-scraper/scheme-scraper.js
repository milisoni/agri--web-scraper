const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Base URL for the schemes JSON
const BASE_URL = 'https://www.myscheme.gov.in/_next/data/YLinIF5KBxJ6ZwwSu0gqP/en/schemes/';
const slugs = ['pm-kisan', 'smam', 'pmksypdmc', 'isac','lhadc','sams','kuy-movcdner','pocs','cpis','pocsm','e-nam','aif','aius','rkvy','nais','spara','cctofp','rkvyshfshc','nmnf','indagff'];
// Function to fetch scheme details
async function fetchSchemeDetails(slug) {
    try {
        const url = `${BASE_URL}${slug}.json?slug=${slug}`;
        const { data } = await axios.get(url);

        // Extract scheme details
        const schemeName = data.pageProps.schemeData.en.basicDetails.schemeName;
        const briefDescription = data.pageProps.schemeData.en.schemeContent.briefDescription;

        return { schemeName, briefDescription };
    } catch (error) {
        console.error(`Error fetching details for slug ${slug}:`, error.message);
        return null;
    }
}

// Endpoint to get all schemes
app.get('/schemes', async (req, res) => {
    try {
        // Example list of slugs for demonstration
        const schemes = await Promise.all(slugs.map(fetchSchemeDetails));
        const validSchemes = schemes.filter(scheme => scheme !== null); // Filter out null responses
        res.json(validSchemes);
        
    } catch (error) {
        console.error('Error in /schemes endpoint:', error.message);
        res.status(500).json({ error: 'Failed to fetch schemes' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

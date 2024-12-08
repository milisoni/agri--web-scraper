const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

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
        const schemeList = data.pageProps.schemeData.en.schemeContent;
        const schemeBenefits = [];
        schemeList.benefits.forEach(section => {
            if (section.type === 'ul_list') {
                section.children.forEach(item => {
                    if (item.type === 'list_item') {
                        const text = item.children[0].text;
                        if (text) schemeBenefits.push(text);
                    }
                });
            }  if (section.type === 'paragraph'){
                section.children.forEach(item => {
                    const text = item.text || '';
                    if (text) schemeBenefits.push(text);
                })
            }
        });

        const schemeUrl = data.pageProps.schemeData.en.applicationProcess[0].url;

        return { schemeName, briefDescription, schemeBenefits, schemeUrl };
    } catch (error) {
        console.error(`Error fetching details for scheme ${slug}:`, error.message);
        return null;
    }
}
app.get('/', async (req,res)=>{
    res.send("Your API IS Running");
})

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

app.get('/blogs', async (req, res) => {
    try {
        const url = 'https://www.agritecture.com/blog/tag/india';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const blogs = [];
        $('article.blog-card').each((index, element) => {
            const title = $(element).find('.blog-card-title').text().trim();
            const description = $(element).find('p').first().text().trim();
            const date = $(element).find('time').text().trim();
            const link = $(element).find('a').attr('href');
            const image = $(element).find('.blog-card-image').css('background-image');

            blogs.push({
                title,
                description,
                date,
                link: link ? `https://www.agritecture.com${link}` : null,
                image: image ? image.replace(/url\(['"]?(.+?)['"]?\)/, '$1') : null
            });
        });

        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load blogs' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

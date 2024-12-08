const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 4000;

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

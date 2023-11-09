const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
const port = 80;

// Use body-parser middleware
app.use(express.urlencoded({ extended: true }));

// Serve HTML form
app.get('/', (req, res) => {
    res.send(`
    <form action="/generate-pdf" method="post">
      <input type="text" name="dl_url" placeholder="Enter URL">
      <button type="submit">Generate PDF</button>
    </form>
  `);
});

// Generate PDF route
app.post('/generate-pdf', async (req, res) => {
    const dl_url = req.body.dl_url;

    if (dl_url) {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        await page.goto(dl_url, { waitUntil: 'networkidle0' });

        const elementHandle = await page.$('#invoice_content');

        if (elementHandle) {
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true, // Enable background graphics
                margin: {
                    top: '0.4in',    // Adjust top margin as needed
                    right: '0.4in',  // Adjust right margin as needed
                    bottom: '0.4in', // Adjust bottom margin as needed
                    left: '0.4in',   // Adjust left margin as needed
                },
            });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
            res.send(pdfBuffer);
        } else {
            res.send('Could not find the specified element.');
        }

        await browser.close();
    } else {
        res.send('Please provide a URL.');
    }

});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

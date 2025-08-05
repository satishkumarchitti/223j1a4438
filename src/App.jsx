
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper } from '@mui/material';
import { Log } from "../logging_middleware/logger";

function App() {
  const [urls, setUrls] = useState([
    { longUrl: '', validity: 30, shortcode: '' },
  ]);
  const [results, setResults] = useState([]);

  const handleInputChange = (index, field, value) => {
    const updatedUrls = [...urls];
    updatedUrls[index][field] = value;
    setUrls(updatedUrls);
  };

  const addUrlInput = () => {
    if (urls.length < 5) {
      setUrls([...urls, { longUrl: '', validity: 30, shortcode: '' }]);
    }
  };

  const validateUrl = (url) => /^https?:\/\/.+\..+/.test(url);

  const handleShorten = async () => {
    const newResults = [];

    for (let i = 0; i < urls.length; i++) {
      const { longUrl, validity, shortcode } = urls[i];

      if (!validateUrl(longUrl)) {
        await Log("frontend", "error", "component", `Invalid URL at index ${i}`);
        continue;
      }

      await Log("frontend", "info", "api", `Shortening URL: ${longUrl}`);

      const generatedShort = shortcode || Math.random().toString(36).substring(2, 8);
      const expiry = new Date(Date.now() + (validity || 30) * 60000);

      newResults.push({
        longUrl,
        shortUrl: `http://localhost:3000/${generatedShort}`,
        expiry: expiry.toISOString(),
      });

      await Log("frontend", "info", "component", `Short URL generated: ${generatedShort}`);
    }

    setResults(newResults);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        React URL Shortener
      </Typography>

      {urls.map((url, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Long URL"
                value={url.longUrl}
                onChange={(e) => handleInputChange(index, 'longUrl', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Validity (min)"
                type="number"
                value={url.validity}
                onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Custom Shortcode"
                value={url.shortcode}
                onChange={(e) => handleInputChange(index, 'shortcode', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button variant="outlined" onClick={addUrlInput} disabled={urls.length >= 5}>
        Add Another URL
      </Button>

      <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleShorten}>
        Shorten URLs
      </Button>

      {results.length > 0 && (
        <Box mt={4}>
          <Typography variant="h5">Shortened URLs:</Typography>
          {results.map((res, index) => (
            <Paper key={index} sx={{ p: 2, mt: 2 }}>
              <Typography>Original: {res.longUrl}</Typography>
              <Typography>
                Short URL: <a href={res.shortUrl} target="_blank" rel="noopener noreferrer">{res.shortUrl}</a>
              </Typography>
              <Typography>Expires at: {res.expiry}</Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default App;

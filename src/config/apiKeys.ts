export const API_KEYS = {
  // RapidAPI key for Realty Mole Property API
  // Get your key at: https://rapidapi.com/realtymole/api/realty-mole-property-api/
  rapidapi: process.env.REACT_APP_RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY',

  // Walk Score API key
  // Get your key at: https://www.walkscore.com/professional/api.php
  walkscore: process.env.REACT_APP_WALKSCORE_KEY || 'YOUR_WALKSCORE_KEY',

  // ATTOM Data API key
  // Get your key at: https://api.developer.attomdata.com/signup
  attomData: process.env.REACT_APP_ATTOMDATA_KEY || 'YOUR_ATTOMDATA_KEY',
}; 
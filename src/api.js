import axios from 'axios';

// Funktion för att hämta CSRF-token
export const getCsrfToken = async () => {
  const response = await axios.patch('https://chatify-api.up.railway.app/csrf');
  return response.data.csrfToken;
};

// Funktion för att registrera en ny användare
export const registerUser = async (username, email, password) => {
  const csrfToken = await getCsrfToken();  // Hämta CSRF-token
  try {
    const response = await axios.post('https://chatify-api.up.railway.app/auth/register', {
      username,
      email,
      password
    }, {
      headers: {
        'X-CSRF-Token': csrfToken,
      }
    });
    return response.data;  // Returnera svar från API
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;  // Kasta fel så det kan hanteras i komponenten
  }
};

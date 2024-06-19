export const generateSong = async (requestData) => {
  try {
    const response = await fetch('https://suno.deno.dev/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'An error occurred while generating songs.');
    return {};
  }
};

export const getSongMetadata = async (ids) => {
  try {
    const response = await fetch(`https://suno.deno.dev/metadata?ids=${ids}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'An error occurred while fetching song metadata.');
    return {};
  }
};

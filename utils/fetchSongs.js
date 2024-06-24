export const generateSong = async (data) => {
  try {
    const response = await fetch('https://suno.deno.dev/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating song:', error);
  }
};

export const getSongMetadata = async (ids) => {
  try {
    const response = await fetch(`https://suno.deno.dev/metadata?ids=${ids}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching song metadata:', error);
  }
};

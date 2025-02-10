const generateAIText = async (controller: AbortController, data: any, onStart: () => void, onStream: (text: string) => void, onDone?: () => void): Promise<void> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
      },
      body: JSON.stringify({
        ...data,
        stream: true
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    if (!response.body) {
      throw new Error('There is no response body');
    }

    onStart();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onDone?.();
        break;
      }

      // Decode the chunk and add it to our buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines in the buffer
      const lines = buffer.split('\n');

      buffer = lines.pop() || ''; // Keep the last incomplete line in the buff
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line === 'data: [DONE]') continue;

        try {
          // Remove 'data: ' prefix if it exists
          const jsonString = line.replace(/^data: /, '');
          const json = JSON.parse(jsonString);
          if (!json.choices) {
            console.log('Problematic line:', line);
            continue;
          }
          const token = json.choices[0].text;
          if (token) {
            onStream(token);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          console.log('Problematic line:', line);
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request was aborted');
    } else {
      console.error('Error fetching streaming response:', error);
    }
    throw error;
  }
};

export { generateAIText };

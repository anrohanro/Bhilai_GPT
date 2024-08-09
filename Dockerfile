# Use a base image with Python and Node.js installed
FROM ubuntu:latest

# Install Python and Node.js
RUN apt-get update && apt-get install -y python3 nodejs npm curl

# Set the working directory in the container
WORKDIR /app

# Copy the backend and webchat folders into the container
COPY backend /app/backend
COPY webchat /app/webchat
COPY README.md /app/README.md

# Install Python pip and create a virtual environment
RUN apt-get install -y python3-pip python3-venv
RUN python3 -m venv /app/venv

# Activate the virtual environment and install backend dependencies
RUN /bin/bash -c "source /app/venv/bin/activate && pip install -r /app/backend/requirements.txt"

# Install and configure Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh
RUN ollama serve & sleep 10 && ollama pull llama3 && ollama create BhilaiGPT_1.0 -f "/app/backend/Modelfile.txt"

# Install webchat dependencies
RUN cd /app/webchat && npm install

# Set the environment variables
ENV BACKEND_PORT=5000
ENV FRONTEND_PORT=3000

# Expose the ports
EXPOSE 5000 3000 11434

# Start the backend and webchat applications
CMD ["/bin/bash", "-c", "source /app/venv/bin/activate && cd /app/backend && python3 index.py & npm start --prefix /app/webchat"]

# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --trusted-host pypi.python.org -r requirements.txt

# Copy the rest of the application's source code from your host to your image filesystem.
COPY . .

# Expose port 8001 to the outside world
EXPOSE 8001

# Command to run the application
# I am assuming your application is started with uvicorn.
# If 'main:app' is incorrect, please adjust it to match your application's entrypoint.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"] 
# Use official Deno runtime
FROM denoland/deno:1.34.3

# Create app directory
WORKDIR /var/task

# Copy function code (when building image); volume mount will override during development
COPY . /var/task

# Allow env and network access; run as non-root in production if desired
EXPOSE 8000

RUN apt update && apt install -y wget

# Start the function runtime by running our function file
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--unstable", "--watch", "api/index.ts"]
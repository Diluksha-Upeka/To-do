#!/bin/bash
echo "Setting up Jenkins Pipeline environment..."

# Create necessary directories
mkdir -p ~/.aws ~/.ssh

# Create AWS credentials file if it doesn't exist
if [ ! -f ~/.aws/credentials ]; then
  echo "Creating AWS credentials file..."
  cat > ~/.aws/credentials << EOL
[default]
aws_access_key_id = YOUR_AWS_ACCESS_KEY_ID
aws_secret_access_key = YOUR_AWS_SECRET_ACCESS_KEY
region = eu-north-1
EOL
  echo "AWS credentials file created."
fi

# Create .env file for Docker Compose
echo "Creating .env file for Docker Compose..."
cat > .env << EOL
DOCKERHUB_USERNAME=your_dockerhub_username
DOCKERHUB_TOKEN=your_dockerhub_token
EOL
echo ".env file created."

# Create Ansible inventory file
echo "Creating Ansible inventory file..."
mkdir -p ansible/inventory
cat > ansible/inventory/aws_ec2.ini << EOL
[aws_ec2]
# This will be dynamically populated by the Jenkins pipeline
EOL
echo "Ansible inventory file created."

# Start Docker Compose
echo "Starting Docker Compose..."
docker-compose up -d

# Wait for Jenkins to start
echo "Waiting for Jenkins to start..."
sleep 30

# Get Jenkins initial admin password
echo "Jenkins initial admin password:"
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

echo "Setup complete! Access Jenkins at http://localhost:8080"
echo "IMPORTANT: Please replace placeholder credentials in .aws/credentials and .env files with your actual credentials!" 
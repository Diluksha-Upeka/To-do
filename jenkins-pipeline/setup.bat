@echo off
echo Setting up Jenkins Pipeline environment...

REM Create necessary directories
if not exist "%USERPROFILE%\.aws" mkdir "%USERPROFILE%\.aws"
if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"

REM Create AWS credentials file if it doesn't exist
if not exist "%USERPROFILE%\.aws\credentials" (
  echo Creating AWS credentials file...
  (
    echo [default]
    echo aws_access_key_id = YOUR_AWS_ACCESS_KEY_ID
    echo aws_secret_access_key = YOUR_AWS_SECRET_ACCESS_KEY
    echo region = eu-north-1
  ) > "%USERPROFILE%\.aws\credentials"
  echo AWS credentials file created.
)

REM Create .env file for Docker Compose
echo Creating .env file for Docker Compose...
(
  echo DOCKERHUB_USERNAME=your_dockerhub_username
  echo DOCKERHUB_TOKEN=your_dockerhub_token
) > .env
echo .env file created.

REM Create Ansible inventory file
echo Creating Ansible inventory file...
if not exist "ansible\inventory" mkdir "ansible\inventory"
(
  echo [aws_ec2]
  echo # This will be dynamically populated by the Jenkins pipeline
) > "ansible\inventory\aws_ec2.ini"
echo Ansible inventory file created.

REM Start Docker Compose
echo Starting Docker Compose...
docker-compose up -d

REM Wait for Jenkins to start
echo Waiting for Jenkins to start...
timeout /t 30 /nobreak

REM Get Jenkins initial admin password
echo Jenkins initial admin password:
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

echo Setup complete! Access Jenkins at http://localhost:8080
echo IMPORTANT: Please replace placeholder credentials in .aws/credentials and .env files with your actual credentials! 
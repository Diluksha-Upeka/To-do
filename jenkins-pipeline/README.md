# Jenkins Pipeline with Terraform, Ansible, and AWS Deployment (Docker Version)

This repository contains a complete CI/CD pipeline setup using Docker containers for Jenkins, Terraform, and Ansible to deploy a MERN stack application on AWS.

## Prerequisites

1. Docker Desktop for Windows installed and running
2. Git installed
3. AWS CLI configured with appropriate credentials
4. GitHub repository with your application code

## Quick Setup

### For Windows Users:
```bash
# Run the setup script
setup.bat
```

### For Linux/Mac Users:
```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

## Manual Setup Instructions

1. **Configure AWS Credentials**:
   - Create AWS credentials file at `~/.aws/credentials`:
     ```ini
     [default]
     aws_access_key_id = your_access_key
     aws_secret_access_key = your_secret_key
     region = eu-north-1
     ```

2. **Configure GitHub Webhook**:
   - Go to your GitHub repository settings
   - Add webhook with URL: `http://localhost:8080/github-webhook/`
   - Content type: application/json
   - Events: Just the push event

3. **Start the Docker Environment**:
   ```bash
   docker-compose up -d
   ```

4. **Initial Jenkins Setup**:
   - Access Jenkins at `http://localhost:8080`
   - Get the initial admin password from the Jenkins container:
     ```bash
     docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
     ```
   - Install suggested plugins
   - Create admin user
   - Add AWS credentials in Jenkins:
     - Go to Manage Jenkins → Manage Credentials → System → Global credentials
     - Add AWS credentials with ID 'AWS_ACCESS_KEY' and 'AWS_SECRET_ACCESS_KEY'
     - Add MONGODB_ATLAS_URI as a secret text credential
     - Add JWT_SECRET as a secret text credential
     - Add DOCKERHUB_TOKEN as a secret text credential

5. **Create Jenkins Pipeline**:
   - Create a new Pipeline job in Jenkins
   - Configure it to use the Jenkinsfile from your repository
   - Enable GitHub webhook trigger

## Directory Structure

```
jenkins-pipeline/
├── Jenkinsfile
├── docker-compose.yml
├── setup.sh
├── setup.bat
├── .gitignore
├── terraform/
│   └── main.tf
├── ansible/
│   ├── playbook.yml
│   ├── deploy.yml
│   └── inventory/
│       └── aws_ec2.ini
└── README.md
```

## Container Management

1. **Start the Environment**:
   ```bash
   docker-compose up -d
   ```

2. **Stop the Environment**:
   ```bash
   docker-compose down
   ```

3. **View Logs**:
   ```bash
   docker-compose logs -f [service_name]
   ```

4. **Access Containers**:
   ```bash
   docker exec -it jenkins bash
   docker exec -it terraform bash
   docker exec -it ansible bash
   ```

## Security Considerations

1. AWS credentials are stored in `~/.aws/credentials`
2. Jenkins credentials are stored in Docker volume
3. Security groups are configured to allow only necessary ports
4. EC2 instance uses SSH key authentication
5. Docker images are pulled from private registry

## Troubleshooting

1. **If Jenkins container fails**:
   - Check Docker logs: `docker-compose logs jenkins`
   - Verify port 8080 is not in use
   - Check Docker socket mount

2. **If Terraform container fails**:
   - Verify AWS credentials
   - Check workspace permissions
   - Verify network connectivity

3. **If Ansible container fails**:
   - Check SSH connectivity
   - Verify inventory file
   - Check playbook syntax

4. **If Docker builds fail**:
   - Check Docker daemon is running
   - Verify Docker Hub credentials
   - Check network connectivity

## Maintenance

1. **Regular Updates**:
   - Update Docker images: `docker-compose pull`
   - Update Jenkins plugins
   - Update Terraform and Ansible versions
   - Monitor AWS costs

2. **Backup**:
   - Jenkins data is in Docker volume
   - AWS credentials in `~/.aws`
   - Terraform state in AWS

3. **Cleanup**:
   - Remove unused Docker images: `docker image prune`
   - Clean Jenkins workspace: `docker exec jenkins rm -rf /var/jenkins_home/workspace/*`
   - Remove Terraform state: `docker exec terraform terraform destroy`

## Important Security Notes

1. **IMPORTANT**: The credentials in this repository are for demonstration purposes only. In a production environment:
   - Rotate all AWS credentials
   - Generate new GitHub tokens
   - Create new Docker Hub tokens
   - Update MongoDB Atlas passwords
   - Generate new JWT secrets

2. The credentials.env file is included in .gitignore to prevent accidental commits. 
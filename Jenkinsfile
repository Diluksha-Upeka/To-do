pipeline {
    agent any
    
    environment {
        AWS_REGION = 'eu-north-1'
        DOCKER_IMAGE = 'dilukshaup/todo-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        APP_ENV = 'production'
        WORKSPACE_UNIX = "${WORKSPACE}".replace('\\', '/').replace('C:', '/c')
    }
    
    stages {
        stage('Test and Verify') {
            steps {
                script {
                    // Verify Docker is available
                    bat """
                        docker --version
                        if %errorlevel% neq 0 exit /b %errorlevel%
                    """
                    
                    // Verify Terraform is available
                    bat """
                        docker run --rm hashicorp/terraform:1.5.7 version
                        if %errorlevel% neq 0 exit /b %errorlevel%
                    """
                    
                    // Verify Ansible is available
                    bat """
                        docker run --rm willhallonline/ansible:latest ansible --version
                        if %errorlevel% neq 0 exit /b %errorlevel%
                    """
                    
                    // Verify AWS credentials
                    withCredentials([usernamePassword(credentialsId: 'AWS_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        bat """
                            docker run --rm ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                amazon/aws-cli:latest sts get-caller-identity
                            if %errorlevel% neq 0 exit /b %errorlevel%
                        """
                    }
                }
            }
        }
        
        stage('Setup Terraform Directory') {
            steps {
                script {
                    // Create terraform directory and copy files
                    bat """
                        if not exist "%WORKSPACE%\\terraform.jenkins" mkdir "%WORKSPACE%\\terraform.jenkins"
                        
                        if not exist "%WORKSPACE%\\terraform.jenkins\\main.tf" (
                            echo Copying Terraform files to workspace
                            xcopy /E /I /Y terraform\\* "%WORKSPACE%\\terraform.jenkins\\"
                        )
                    """
                    
                    // Create a backend.tf file for local state
                    writeFile file: "${WORKSPACE}\\terraform.jenkins\\backend.tf", text: """
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
"""
                }
            }
        }
        
        stage('Terraform Infrastructure') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'AWS_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        // Initialize Terraform with fresh state
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                -w /workspace ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                --user root ^
                                hashicorp/terraform:1.5.7 init -reconfigure
                            if %errorlevel% neq 0 exit /b %errorlevel%
                            
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                -w /workspace ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                -e TF_VAR_docker_image="%DOCKER_IMAGE%:%DOCKER_TAG%" ^
                                --user root ^
                                hashicorp/terraform:1.5.7 plan -out=tfplan
                            if %errorlevel% neq 0 exit /b %errorlevel%
                            
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                -w /workspace ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                -e TF_VAR_docker_image="%DOCKER_IMAGE%:%DOCKER_TAG%" ^
                                --user root ^
                                hashicorp/terraform:1.5.7 apply -auto-approve tfplan
                            if %errorlevel% neq 0 exit /b %errorlevel%
                        """
                    }
                }
            }
        }
        
        stage('Get EC2 Information') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'AWS_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        try {
                            // Get EC2 instance public IP
                            bat """
                                docker run --rm ^
                                    -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                    -w /workspace ^
                                    hashicorp/terraform:1.5.7 output -raw instance_public_ip > "%WORKSPACE%\\ec2_ip.txt"
                                if %errorlevel% neq 0 exit /b %errorlevel%
                            """
                            
                            // Read EC2 IP for later use
                            def ec2PublicIp = readFile("${WORKSPACE}/ec2_ip.txt").trim()
                            echo "EC2 Public IP: ${ec2PublicIp}"
                            env.EC2_PUBLIC_IP = ec2PublicIp
                        } catch (Exception e) {
                            echo "Error getting EC2 info: ${e.message}"
                            error "Failed to get EC2 information. Please check Terraform outputs."
                        }
                    }
                }
            }
        }
        
        stage('Ansible Configuration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'MONGODB_ATLAS_URI', variable: 'MONGODB_URI'),
                        string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                        file(credentialsId: 'EC2_SSH_KEY', variable: 'SSH_KEY_FILE')
                    ]) {
                        // Prepare ansible directory
                        bat """
                            if not exist "%WORKSPACE%\\ansible.jenkins" mkdir "%WORKSPACE%\\ansible.jenkins"
                            if not exist "%WORKSPACE%\\ansible.jenkins\\inventory" mkdir "%WORKSPACE%\\ansible.jenkins\\inventory"
                            
                            copy /Y "%SSH_KEY_FILE%" "%WORKSPACE%\\ansible.jenkins\\inventory\\TODO.pem"
                            
                            icacls "%WORKSPACE%\\ansible.jenkins\\inventory\\TODO.pem" /inheritance:r
                            icacls "%WORKSPACE%\\ansible.jenkins\\inventory\\TODO.pem" /grant:r "%USERNAME%:(R,W)"
                        """
                        
                        // Create inventory file with EC2 IP
                        writeFile file: "${WORKSPACE}/ansible.jenkins/inventory.ini", text: """[ec2_instances]
${env.EC2_PUBLIC_IP} ansible_user=ec2-user ansible_ssh_private_key_file=/ansible/inventory/TODO.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no'
"""
                        
                        // Copy ansible playbook if not exists
                        bat """
                            if not exist "%WORKSPACE%\\ansible.jenkins\\playbook.yml" (
                                if exist "%WORKSPACE%\\ansible\\playbook.yml" (
                                    copy /Y "%WORKSPACE%\\ansible\\playbook.yml" "%WORKSPACE%\\ansible.jenkins\\"
                                ) else (
                                    echo "ERROR: playbook.yml not found in ansible directory"
                                    type nul > "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "---" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "- name: Configure EC2 instance" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "  hosts: ec2_instances" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "  become: yes" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "  tasks:" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "    - name: Install Docker" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "      yum:" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "        name: docker" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "        state: present" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "    - name: Start Docker service" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "      service:" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "        name: docker" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "        state: started" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                    echo "        enabled: yes" >> "%WORKSPACE%\\ansible.jenkins\\playbook.yml"
                                )
                            )
                        """
                        
                        // Run Ansible playbook
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/ansible.jenkins:/ansible" ^
                                -w /ansible ^
                                -e MONGODB_ATLAS_URI="%MONGODB_URI%" ^
                                -e JWT_SECRET="%JWT_SECRET%" ^
                                -e DOCKER_IMAGE="%DOCKER_IMAGE%:%DOCKER_TAG%" ^
                                -e EC2_PUBLIC_IP="%EC2_PUBLIC_IP%" ^
                                willhallonline/ansible:latest ^
                                ansible-playbook -i inventory.ini playbook.yml -v
                            if %errorlevel% neq 0 exit /b %errorlevel%
                        """
                    }
                }
            }
        }
        
        stage('Docker Build and Push') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'DOCKERHUB_CREDENTIALS', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        // Check if backend directory exists
                        bat """
                            if not exist "%WORKSPACE%\\backend" (
                                echo "ERROR: backend directory not found!"
                                exit /b 1
                            )
                        """
                        
                        // Build and push Docker image
                        bat """
                            cd backend
                            docker build -t %DOCKER_IMAGE%:%DOCKER_TAG% .
                            if %errorlevel% neq 0 exit /b %errorlevel%
                            
                            echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin
                            if %errorlevel% neq 0 exit /b %errorlevel%
                            
                            docker push %DOCKER_IMAGE%:%DOCKER_TAG%
                            if %errorlevel% neq 0 exit /b %errorlevel%
                            
                            docker tag %DOCKER_IMAGE%:%DOCKER_TAG% %DOCKER_IMAGE%:latest
                            docker push %DOCKER_IMAGE%:latest
                            if %errorlevel% neq 0 exit /b %errorlevel%
                        """
                    }
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'EC2_SSH_KEY', variable: 'SSH_KEY_FILE')]) {
                        // Copy SSH key to workspace
                        bat """
                            copy /Y "%SSH_KEY_FILE%" "%WORKSPACE%\\ec2-key.pem"
                            icacls "%WORKSPACE%\\ec2-key.pem" /inheritance:r
                            icacls "%WORKSPACE%\\ec2-key.pem" /grant:r "%USERNAME%:(R,W)"
                        """
                        
                        // Use SSH to pull and run the new Docker image
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/ec2-key.pem:/key.pem" ^
                                willhallonline/ansible:latest ^
                                ssh -i /key.pem -o StrictHostKeyChecking=no ec2-user@%EC2_PUBLIC_IP% "sudo docker pull %DOCKER_IMAGE%:%DOCKER_TAG% && sudo docker stop todo-app || true && sudo docker rm todo-app || true && sudo docker run -d --name todo-app -p 3000:3000 -e NODE_ENV=production %DOCKER_IMAGE%:%DOCKER_TAG%"
                            if %errorlevel% neq 0 exit /b %errorlevel%
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            
            script {
                echo "Application deployed successfully to http://${env.EC2_PUBLIC_IP}:3000"
            }
        }
        failure {
            echo 'Pipeline failed! Please check the logs for details.'
        }
        always {
            // Cleanup temporarily copied files
            bat """
                if exist "%WORKSPACE%\\ec2-key.pem" del "%WORKSPACE%\\ec2-key.pem"
                if exist "%WORKSPACE%\\ec2_ip.txt" del "%WORKSPACE%\\ec2_ip.txt"
            """
            
            cleanWs()
        }
    }
}
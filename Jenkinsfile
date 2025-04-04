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
                        if errorlevel 1 exit /b 1
                    """
                    
                    // Verify Terraform is available
                    bat """
                        docker run --rm hashicorp/terraform:1.5.7 version
                        if errorlevel 1 exit /b 1
                    """
                    
                    // Verify Ansible is available
                    bat """
                        docker run --rm willhallonline/ansible:latest ansible --version
                        if errorlevel 1 exit /b 1
                    """
                    
                    // Verify AWS credentials
                    withCredentials([usernamePassword(credentialsId: 'AWS_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        bat """
                            docker run --rm ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                amazon/aws-cli sts get-caller-identity
                            if errorlevel 1 exit /b 1
                        """
                    }
                }
            }
        }
        
        stage('Terraform Infrastructure') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'AWS_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        // Initialize Terraform with migration
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                -w /workspace ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                --user root ^
                                hashicorp/terraform:1.5.7 init -migrate-state -force-copy -lock=false
                            if errorlevel 1 exit /b 1
                            
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                -w /workspace ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                --user root ^
                                hashicorp/terraform:1.5.7 plan -out=tfplan -lock=false
                            if errorlevel 1 exit /b 1
                            
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                -w /workspace ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                --user root ^
                                hashicorp/terraform:1.5.7 apply tfplan -lock=false
                            if errorlevel 1 exit /b 1
                        """
                    }
                }
            }
        }
        
        stage('Ansible Configuration') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'MONGODB_ATLAS_URI', variable: 'MONGODB_URI'),
                                   string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')]) {
                        // Get EC2 instance public IP
                        def tfOutput = bat(script: """
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                -w /workspace ^
                                hashicorp/terraform:1.5.7 output -raw instance_public_ip
                        """, returnStdout: true).trim()
                        
                        // Update inventory file with EC2 public IP
                        bat """
                            powershell -Command "(Get-Content 'ansible.jenkins/inventory.ini') -replace 'EC2_PUBLIC_IP', '%tfOutput%' | Set-Content 'ansible.jenkins/inventory.ini'"
                        """
                        
                        // Verify Ansible inventory and SSH key
                        bat """
                            if not exist "ansible.jenkins/inventory/TODO.pem" (
                                echo Error: SSH key not found in ansible.jenkins/inventory/TODO.pem
                                exit /b 1
                            )
                            
                            if not exist "ansible.jenkins/inventory.ini" (
                                echo Error: Inventory file not found
                                exit /b 1
                            )
                        """
                        
                        // Run Ansible playbook
                        bat """
                            set "MONGODB_URI_ESCAPED=!MONGODB_URI!"
                            set "EC2_PUBLIC_IP=!tfOutput!"
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/ansible.jenkins:/ansible" ^
                                -w /ansible ^
                                -e "MONGODB_ATLAS_URI=!MONGODB_URI_ESCAPED!" ^
                                -e "JWT_SECRET=!JWT_SECRET!" ^
                                -e "EC2_PUBLIC_IP=!tfOutput!" ^
                                willhallonline/ansible:latest ^
                                ansible-playbook -i inventory.ini playbook.yml
                            if errorlevel 1 exit /b 1
                        """
                    }
                }
            }
        }
        
        stage('Docker Build and Push') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'DOCKERHUB_CREDENTIALS', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        // Build and push Docker image
                        bat """
                            cd backend
                            docker build -t %DOCKER_IMAGE%:%DOCKER_TAG% .
                            if errorlevel 1 exit /b 1
                            
                            echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin
                            if errorlevel 1 exit /b 1
                            
                            docker push %DOCKER_IMAGE%:%DOCKER_TAG%
                            if errorlevel 1 exit /b 1
                        """
                    }
                }
            }
        }
        
        stage('AWS Deployment') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'AWS_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        // This stage updates the EC2 instance with the new Docker image
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE_UNIX%/terraform.jenkins:/workspace" ^
                                -w /workspace ^
                                -e AWS_ACCESS_KEY_ID=%AWS_ACCESS_KEY_ID% ^
                                -e AWS_SECRET_ACCESS_KEY=%AWS_SECRET_ACCESS_KEY% ^
                                -e AWS_REGION=%AWS_REGION% ^
                                -e DOCKER_IMAGE=%DOCKER_IMAGE% ^
                                -e DOCKER_TAG=%DOCKER_TAG% ^
                                hashicorp/terraform:1.5.7 apply -auto-approve
                            if errorlevel 1 exit /b 1
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Pipeline failed! Please check the logs for details.'
        }
    }
}
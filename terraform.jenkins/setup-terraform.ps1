# Create AWS credentials directory if it doesn't exist
if (-not (Test-Path "$env:USERPROFILE\.aws")) {
    New-Item -ItemType Directory -Path "$env:USERPROFILE\.aws"
}

# Create AWS credentials file
@"
[default]
aws_access_key_id = YOUR_NEW_AWS_ACCESS_KEY
aws_secret_access_key = YOUR_NEW_AWS_SECRET_KEY
region = eu-north-1
"@ | Out-File -FilePath "$env:USERPROFILE\.aws\credentials"

# Initialize and apply Terraform
Set-Location -Path "terraform.jenkins"
terraform init
terraform apply -auto-approve 
# Jenkins credentials update script
$jenkinsUrl = "http://localhost:8080"
$jenkinsUser = "admin"
$jenkinsApiToken = "YOUR_JENKINS_API_TOKEN"

# Base64 encode the credentials
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${jenkinsUser}:${jenkinsApiToken}"))

# AWS Credentials
$awsCreds = @{
    "credentials" = @{
        "scope" = "GLOBAL"
        "id" = "AWS_ACCESS_KEY"
        "username" = "YOUR_NEW_AWS_ACCESS_KEY"
        "password" = "YOUR_NEW_AWS_SECRET_KEY"
        "description" = "AWS Credentials for Terraform and EC2"
        "$class" = "com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl"
    }
}

# Convert to JSON
$awsCredsJson = $awsCreds | ConvertTo-Json

# Update AWS credentials
Invoke-RestMethod -Uri "${jenkinsUrl}/credentials/store/system/domain/_/credential/AWS_ACCESS_KEY/configSubmit" `
    -Method Post `
    -Headers @{Authorization = "Basic $auth"} `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $awsCredsJson

Write-Host "Jenkins credentials updated successfully!" 
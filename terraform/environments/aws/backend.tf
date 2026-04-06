terraform {
  backend "s3" {
    bucket         = "infraforge-terraform-state"
    key            = "environments/aws/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "infraforge-terraform-locks"

    # Prevent accidental state corruption
    skip_metadata_api_check = false
  }
}

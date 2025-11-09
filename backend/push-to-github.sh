#!/bin/bash
echo "Enter your GitHub Personal Access Token:"
read -s TOKEN
git push https://$TOKEN@github.com/kendall-creator/7more-email-backend.git main
echo "Push complete!"

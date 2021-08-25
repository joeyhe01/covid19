sudo docker image prune -a -f
sudo docker run -d -p 8080:8080 --restart unless-stopped -e spring_profiles_active=prod --name covid19-api hexufeng/guoyi:covid19-api

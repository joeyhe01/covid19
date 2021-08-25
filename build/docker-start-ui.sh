sudo docker image prune -a -f
sudo docker run -d -p 80:3000 --restart unless-stopped --name covid19-ui hexufeng/guoyi:covid19-ui

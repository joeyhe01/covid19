docker system prune
sudo docker stop covid19-api
sudo docker stop covid19-ui
sudo docker rm covid19-api
sudo docker rm covid19-ui
sudo docker rmi -f hexufeng/guoyi:covid19-api
sudo docker rmi -f hexufeng/guoyi:covid19-ui
./docker-start-api.sh
./docker-start-ui.sh

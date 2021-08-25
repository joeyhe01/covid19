#here use commitID as docker tag
commitId=$(git rev-parse --short=7 HEAD)
tag=covid19-api
echo "new tag: $tag"

cd ../backend
mvn clean package -Dmaven.test.skip=true

cd ..
mkdir -p build/backend
cp ./backend/target/backend-0.0.1-SNAPSHOT.jar ./build/backend/
cd build

docker build -f Dockerfile_api -t hexufeng/guoyi:$tag .
docker push hexufeng/guoyi:$tag


#Step4: Clean Directory
cd ..
rm -fr build/backend


#docker build -t 480609039449.dkr.ecr.us-west-2.amazonaws.com/kube-api-server:$tag .
#login first
#$(aws ecr get-login --no-include-email --region us-west-2)
#docker push 480609039449.dkr.ecr.us-west-2.amazonaws.com/kube-api-server:$tag

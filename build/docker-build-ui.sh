#here use commitID as docker tag
commitId=$(git rev-parse --short=7 HEAD)
tag=covid19-ui
echo "new tag: $tag"

#mvn -T 4C -Dmaven.test.skip=true clean package;
cd ../frontend/api && npm install && cd ..;
cd ui && npm install && npm run build && cd ..;
cd mobile && flutter build web && cd ..;

#then, we must change all the path inside index.html with '/' in front
#sed -i -e 's|src="|src="\/v3\/|g' ./dist/index.html;
#sed -i -e 's|href="styles|href="\/v3\/styles|g' ./dist/index.html;
cd ../..;

#start generating docker image
mkdir -p build/api
mkdir -p build/ui/dist
mkdir -p build/mobile/build/web
cp -r frontend/api/ build/api/
cp -r frontend/ui/dist/ build/ui/dist/
cp -r frontend/mobile/build/web build/mobile/build/web

cd build
cp api/config/env/production-kubernete.js api/config/env/development.js

#docker build -t 480609039449.dkr.ecr.us-west-2.amazonaws.com/ngsc:$tag .
docker build -f Dockerfile_ui -t hexufeng/guoyi:$tag .
#docker tag datavisor/ngsc localhost:5000/datavisor/ngsc
#$(aws ecr get-login --no-include-email --region us-west-2)
#docker push 480609039449.dkr.ecr.us-west-2.amazonaws.com/ngsc:$tag
docker push hexufeng/guoyi:$tag

cd ..

#Step4: Clean Directory
rm -fr build/api
rm -fr build/ui
rm -fr build/mobile

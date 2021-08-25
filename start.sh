cd backend
./mvnw spring-boot:run > ../logs/backend_api.log &
cd ..
cd frontend/api && npm start > ../../logs/api.log &
cd frontend/ui && npm start > ../../logs/ui.log &

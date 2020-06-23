# Litmus Portal

## Local development
## Set up backend environments

1) Install dependencies
Go to the backend folder and install modules defined in go.mod
```bash
go mod download
```

2) Create database
```bash
go run scripts/gqlgen.go init
```

3) Install air if you want hot reloading
you can use hot reoloading with [air](https://github.com/cosmtrek/air).
```bash
air
```

## Set up frontend environments
Go to the fronend folder and run the following commands.
```bash
npm install
npm run start
```

## Production deployment
First, go to the project root directory and enable bash files
```bash
sudo chmod 777 start_k8s.sh
sudo chmod 777 remove_k8s.sh
sudo chmod 777 deploy_production.sh
```

1) Deploy
```bash
start_k8s.sh
```

2) Remove pods/services/deployments
```bash
remove_k8s.sh
```

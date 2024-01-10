# Greenboard V2: QE Dashboard using CERN

## Setup node
```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install node 18.15.0
npm install --global yarn
```

## To start backend server
```shell
cd server
yarn
yarn start
```

## To start frontend vite
```
cd client
yarn
yarn dev
```

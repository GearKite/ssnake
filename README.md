# Snake in Phaser (JPTC game jam)

This is a simple snake game made with Phaser and SvelteKit, and an example of _anything that can be written in JavaScript will eventually be written in JavaScript_, but in this case it's actually TypeScript :D

## Installation

### Docker

`docker pull ghcr.io/gearkite/ssnake:main`  
`docker run -p 3000:3000 ssnake`

### Source

1. Install [Node.js](https://nodejs.org)

2. Install dependencies  
   `cd client && npm install && cd ..`  
   `cd server && npm install && cd ..`

3. Run the build script  
   `bash ./scripts/build.sh`

4. Go into `server`  
   `cd ./server`

5. `Start the server`  
   `npm run start`

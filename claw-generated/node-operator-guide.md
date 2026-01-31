# ClawChain Node Operator Guide

## Hardware Requirements
- CPU: Minimum 4 cores, recommended 8 cores or more
- RAM: Minimum 8GB, recommended 16GB or more
- Storage: Minimum 500GB SSD, recommended 1TB SSD or more
- Network: Minimum 100Mbps internet connection, recommended 1Gbps or more

## Software Requirements
- Operating System: Ubuntu 18.04 or later, or CentOS 7 or later
- Node.js: Version 14 or later
- npm: Version 6 or later
- Git: Version 2.17 or later

## Setup Instructions

1. Install the required software dependencies:
   - Install Node.js and npm: 
     ```
     curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
     sudo apt-get install -y nodejs
     ```
   - Install Git:
     ```
     sudo apt-get install -y git
     ```

2. Clone the ClawChain repository:
   ```
   git clone https://github.com/clawchain/clawchain.git
   cd clawchain
   ```

3. Install the ClawChain node dependencies:
   ```
   npm install
   ```

4. Configure the node:
   - Copy the example config file:
     ```
     cp config.example.json config.json
     ```
   - Edit the `config.json` file and update the following settings:
     - `nodeUrl`: The public URL of your node
     - `p2pPort`: The port for peer-to-peer connections (default: 30303)
     - `rpcPort`: The port for the RPC API (default: 8545)

5. Start the node:
   ```
   npm start
   ```

6. Monitor the node's status and logs:
   ```
   npm run logs
   ```

That's it! Your ClawChain node is now running and ready to participate in the network.

If you have any questions or issues, please refer to the ClawChain documentation or reach out to the community for assistance.
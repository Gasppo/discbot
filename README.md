# Discbot

## Overview

Discbot is a Discord bot designed to manage invites, referrals, and roles within your Discord server. It is implemented in TypeScript and utilizes Prisma for database management.

## Features

- **Invite Management**: Track and manage invites to the Discord server.
- **Referral System**: Implement a referral system to reward users for inviting new members.
- **Role Management**: Handle role updates and assignments within the server.

## Getting Started

### Prerequisites

- Node.js
- A Discord account and a server to test the bot

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Gasppo/discbot.git
   ```
2. Install dependencies using pnpm:
   ```sh
   pnpm install
   ```
3. Configure your `.env` file with your Discord bot token and other necessary environment variables.
4. Run the bot:
   ```sh
   pnpm run start
   ```

## Deployment on Google Cloud Platform (GCP)

### Prerequisites

- A Google Cloud Platform account and a project set up.
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured on your local machine.

### Step 1: Create a VM Instance

1. Navigate to the [GCP Console](https://console.cloud.google.com/).
2. Go to the "VM instances" section within the "Compute Engine".
3. Click on "Create Instance".
4. Choose a name for your instance and select the region and zone of your choice.
5. In the "Machine Configuration" section, choose the "f1-micro" machine type.
6. In the "Boot disk" section, select an OS (for example, "Debian" or "Ubuntu").
7. Click on "Create" to initiate the VM instance creation.

### Step 2: Set Up the VM Instance

1. Once the VM instance is ready, click on the "SSH" button to connect to the instance.
2. Update the package lists for upgrades and new package installations:
   ```sh
   sudo apt update && sudo apt upgrade -y
   ```
3. Install Node.js and npm:
   ```sh
   sudo apt install -y nodejs npm
   ```
4. Clone the Discbot repository:
   ```sh
   git clone https://github.com/Gasppo/discbot.git
   ```
5. Navigate to the project directory and install dependencies using pnpm:
   ```sh
   cd discbot
   npm install -g pnpm
   pnpm install
   ```
6. Configure your `.env` file with your Discord bot token and other necessary environment variables.

### Step 3: Run the Bot

1. Start the bot using pnpm:
   ```sh
   pnpm run start
   ```
   
### Step 4: Keep the Bot Running

To keep the bot running even after closing the SSH session, consider using a process manager like [PM2](https://pm2.keymetrics.io/).

1. Install PM2:
   ```sh
   npm install -g pm2
   ```
2. Start the bot with PM2:
   ```sh
   pm2 start src/index.ts --name discbot
   ```
   
### Step 5: Set Up Firewall Rules (Optional)

If your bot needs to communicate with external services or be accessible through specific ports, ensure to configure the firewall rules accordingly in the GCP console under "VPC network" > "Firewall".

---

**Note**: Ensure to secure your VM instance by configuring firewall rules, using SSH keys for authentication, and regularly updating the system packages. For production deployments, consider using environment variables for sensitive data and setting up a CI/CD pipeline for automated deployments.

---

## Usage

### Commands

Discbot responds to various commands to help manage your Discord server:

- `!refrank`: Replies with the number of members you have referred.
- `!refreshrole`: Refreshes your role based on the number of referrals.
- `!clearinvites`: Clears invites from the server (Note: This command should be restricted to certain roles or users to prevent misuse).

### Referral System

Discbot tracks invites and assigns roles based on the number of distinct referrals a user has:

- **Mode Invite Pioneer**: Assigned when a user has referred at least 1 member.
- **Mode Invite Ambassador**: Assigned when a user has referred at least 5 members.
- **Mode Invite King**: Assigned when a user has referred at least 10 members.

### Role Management

When a user joins the server using an invite link, the bot processes the invite and assigns roles based on the referral count. If a user has a "Verified" role, their referrals are validated, and the roles of the users they invited are refreshed.

### Invite Management

Discbot keeps track of the invites used to join the server and logs them for reference. It can also clear invites that are older than 1 hour and have a maximum age of less than 2592000 seconds (30 days).

---

**Note**: Ensure to verify and test the bot's functionalities in your server to confirm the exact workings and possible additional features. If there are more commands or functionalities, consider adding them to the "Usage" section for comprehensive guidance to the users.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Gasppo - [Your Email](mailto:garciagb24@gmail.com)

Project Link: [https://github.com/Gasppo/discbot](https://github.com/Gasppo/discbot)

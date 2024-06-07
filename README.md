# MyEmail

MyEmail is a Node.js application that integrates with Microsoft Outlook mails and Elasticsearch. This repository contains the source code and Docker configuration for running the application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Azure Account](https://azure.microsoft.com/en-us/free/)

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/Ashir-zuhaib/myemail.git
    cd myemail
    ```

2. Create a `Dockerfile` in the root directory of your project with the following content:

    ```dockerfile
    # Use the official Node.js runtime as the base image
    FROM node:latest

    # Set the working directory in the container
    WORKDIR /usr/src/app

    # Copy package.json and package-lock.json to the working directory
    COPY package*.json ./

    # Install application dependencies
    RUN npm install

    # Copy the rest of your application code to the working directory
    COPY . .

    # Expose the port your application runs on
    EXPOSE 3000

    # Command to run your application
    CMD ["npm", "start"]
    ```

3. Ensure your `docker-compose.yml` file in the root directory looks like this:

    ```yaml
    version: '3'
    services:
      elasticsearch:
        image: docker.elastic.co/elasticsearch/elasticsearch:7.17.5
        container_name: elasticsearch
        environment:
          - discovery.type=single-node
        ports:
          - "9200:9200"
    
      app:
        build: .
        container_name: emailhome
        ports:
          - "3000:3000"
        depends_on:
          - elasticsearch
        environment:
          - ELASTICSEARCH_HOST=http://elasticsearch:9200
          - CLIENT_ID=${CLIENT_ID}
          - SECRET_KEY=${SECRET_KEY}
          - TENANT_ID=${TENANT_ID}
          - ELASTIC_NODE_KEY=${ELASTIC_NODE_KEY}
          - ELASTIC_API_KEY=${ELASTIC_API_KEY}
    ```

## Usage

1. Build and run the Docker containers:

    ```sh
    docker-compose up --build
    ```

2. The Node.js application should now be running and accessible at `http://localhost:3000`.

3. Elasticsearch should be accessible at `http://localhost:9200`.

## Configuration

### Azure Cloud Setup

To integrate with Microsoft Outlook mails, you need to set up an application on Azure and obtain the necessary credentials.

1. **Create an Azure AD application:**
   - Go to the [Azure portal](https://portal.azure.com/).
   - Navigate to "Azure Active Directory" > "App registrations" > "New registration".
   - Enter a name for the application and register it.

2. **Obtain the following credentials from the Azure portal:**
   - `CLIENT_ID`: Found on the application registration page.
   - `SECRET_KEY`: Create a new client secret in the "Certificates & secrets" section.
   - `TENANT_ID`: Found in the "Azure Active Directory" > "Overview" section.

### Environment Variables

Create a `.env` file in the root of your project and add the following variables:

```env
CLIENT_ID=your_microsoft_client_id_here
SECRET_KEY=your_microsoft_secret_key_here
TENANT_ID=your_microsoft_tenant_id_here
ELASTIC_NODE_KEY=your_elastic_deploy_url_here
ELASTIC_API_KEY=your_elastic_api_key_here

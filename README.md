# Node.js_RabbitMQ_Microservices
This project demonstrates a simple implementation of microservices using Node.js and RabbitMQ. The project consists of two services: M1 and M2.

## About

- **M1**: This is a web service that exposes HTTP endpoints to process and fetch data. The data received for processing is sent to a RabbitMQ queue. It also fetches processed data based on the correlation ID received after submitting data for processing.
- **M2**: This is a worker service that listens to the RabbitMQ queue for tasks. It processes the tasks and sends them back to M1 via a results queue in RabbitMQ.

You can also use a tool like Postman to easily test the GET and POST requests to the M1 service.

## Requirements

The following software is required to run the project:

1. **Docker**: Docker is used to create, deploy, and run applications using containers. Install Docker by following the instructions on the [official Docker website](https://docs.docker.com/get-docker/).
2. **Docker Compose**: Docker Compose is a tool for defining and running multi-container Docker applications. It is included as part of the Docker installation on Windows and Mac. For other operating systems, you can download it by following the instructions on the [official Docker website](https://docs.docker.com/compose/install/).

## Running the project

Before running the project, ensure that Docker and Docker Compose are correctly installed on your machine. 

1. Clone the repository to your local machine.
2. Navigate to the project directory in the terminal.
3. Run the following command to start the services:

   ```sh
   docker-compose up --build
   ```

## Running the tests

To run tests, use the following steps:

1. First, ensure the RabbitMQ service is running. You can start it by running the following command:

   ```sh
   docker-compose up rabbitmq
   ```

2. In a new terminal, you can run the tests using the following command:

   ```sh
   docker-compose run --rm m1 npm test
   ```

## Contributions and Questions

If you want to contribute to this project, please feel free to make a pull request. For major changes, please open an issue first to discuss what you would like to change. 

If you have any questions about the project, you can raise an issue or contact the project owner directly.

Happy Coding!
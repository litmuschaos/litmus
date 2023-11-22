# README for Setting Up API Documentation

## Overview

This guide details the steps to set up and generate API documentation for your project using Swagger and GoSwagger. Swagger is used to create an OpenAPI specification file (`swagger.yaml`), and GoSwagger serves this specification file on a local server.
.

## Prerequisites

Before beginning, ensure that you have the following installed:

- Go programming language environment
- `swaggo/swag` library
- `goswagger.io` tool

## Installation

### Step 1: Install Swagger

First, you need to install `swag`, a tool for generating Swagger 2.0 documents for Go applications. Use the following command to install it:

```bash
go get -u github.com/swaggo/swag/cmd/swag
```

For more details, visit the [swag GitHub repository](https://github.com/swaggo/swag).

### Step 2: Install GoSwagger

Next, install GoSwagger, which will serve your Swagger specification file:

```bash
go get -u github.com/go-swagger/go-swagger/cmd/swagger
```

For additional information, refer to the [GoSwagger website](https://goswagger.io/).

## Setting Up Documentation

### Step 1: Annotate Your API

You need to annotate your Go functions to define the API specifications. These annotations are used by Swagger to generate documentation.

#### Example Annotation:

```go
// DexLogin     godoc
//
//  @Description    DexRouter creates all the required routes for OAuth purposes.
//  @Tags           DexRouter
//  @Accept         json
//  @Produce        json
//  @Failure        500 {object}    response.ErrServerError
//  @Success        200 {object}    response.Response{}
//  @Router         /dex/login [get]
//
// DexLogin handles and redirects to DexServer to proceed with OAuth
func DexLogin() gin.HandlerFunc {
    // ... function implementation ...
}
```

#### Formatting:

After adding the annotations run this command to fix and update the annotation formatting

```bash
swag fmt .
```

### Step 3: Define Response Structures in `doc.go`

In your handler folder, create or update a file named `doc.go`. Here, define the structures for your responses and errors.

#### Example Structures:

```go
package handler

// LoginResponse represents the response structure for login.
type LoginResponse struct {
	accessToken string
	projectID   string
	projectRole string
	expiresIn   string
}

// ErrServerError represents an error structure for server errors.
type ErrServerError struct {
	Code    int    `json:"code" example:"500"`
	Message string `json:"message" example:"Unexpected server error"`
}
```

### Step 4: Generate Swagger Documentation

After annotating your API and defining your responses, run the following command in your project root to generate the `swagger.yaml` file:

```bash
swag init
```

This command scans your project and creates a Swagger specification from your annotations.

### Step 5: Serve the Swagger Specification

Finally, use GoSwagger to serve your Swagger specification file. This allows you to view your API documentation in a web browser. By default the API docs will be generated with Redocly.

```bash
swagger serve swagger.yaml
```

To run the orginal swagger format

```bash
swagger serve -F=swagger swagger.yaml
```

This command starts a local server hosting your API documentation.

## Conclusion

With these steps, you should now have a fully functional API documentation setup using Swagger and GoSwagger. Remember to regularly update your annotations and regenerate the Swagger file to keep your documentation in sync with your API.

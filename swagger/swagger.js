// this file was generated by serverless-auto-swagger
            module.exports = {
  "swagger": "2.0",
  "info": {
    "title": "short-linker",
    "version": "1"
  },
  "paths": {
    "/auth/register": {
      "post": {
        "summary": "register",
        "description": "",
        "operationId": "register.post.auth/register",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "security": [
          {
            "Authorization": []
          }
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Body required in the request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/User"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "New user registered",
            "schema": {
              "$ref": "#/definitions/Token"
            }
          },
          "400": {
            "description": "Invalid body params",
            "schema": {
              "$ref": "#/definitions/ErrorArr"
            }
          },
          "409": {
            "description": "User already exists",
            "schema": {
              "$ref": "#/definitions/ErrorStr"
            }
          },
          "500": {
            "description": "Server error",
            "schema": {
              "$ref": "#/definitions/ErrorStr"
            }
          }
        }
      }
    },
    "/auth/login": {
      "post": {
        "summary": "login",
        "description": "",
        "operationId": "login.post.auth/login",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "security": [
          {
            "Authorization": []
          }
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Body required in the request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/User"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful login",
            "schema": {
              "$ref": "#/definitions/Token"
            }
          },
          "400": {
            "description": "Invalid params",
            "schema": {
              "$ref": "#/definitions/ErrorArr"
            }
          },
          "500": {
            "description": "Server error",
            "schema": {
              "$ref": "#/definitions/ErrorStr"
            }
          }
        }
      }
    },
    "/": {
      "post": {
        "summary": "createShortLink",
        "description": "",
        "operationId": "createShortLink.post./",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "security": [
          {
            "Authorization": []
          }
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Body required in the request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/CreateLink"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "Successfully create a short link",
            "schema": {
              "$ref": "#/definitions/Link"
            }
          },
          "400": {
            "description": "Invalid params",
            "schema": {
              "$ref": "#/definitions/ErrorArr"
            }
          },
          "409": {
            "description": "Can't create a new short link",
            "schema": {
              "$ref": "#/definitions/ErrorStr"
            }
          }
        }
      }
    },
    "/{id}": {
      "get": {
        "summary": "goToOriginalLink",
        "description": "",
        "operationId": "goToOriginalLink.get./{id}",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "security": [
          {
            "Authorization": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "301": {
            "description": "Redirect to original link"
          },
          "400": {
            "description": "Link expired",
            "schema": {
              "$ref": "#/definitions/ErrorStr"
            }
          },
          "404": {
            "description": "Not link",
            "schema": {
              "$ref": "#/definitions/ErrorStr"
            }
          }
        }
      },
      "delete": {
        "summary": "deleteLink",
        "description": "",
        "operationId": "deleteLink.delete./{id}",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "security": [
          {
            "Authorization": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully delete a short link"
          },
          "403": {
            "description": "You aren't owner",
            "schema": {
              "$ref": "#/definitions/ErrorStr"
            }
          },
          "404": {
            "description": "Not link",
            "schema": {
              "$ref": "#/definitions/ErrorStr"
            }
          }
        }
      }
    },
    "/links": {
      "get": {
        "summary": "getUsersLinks",
        "description": "",
        "operationId": "getUsersLinks.get.links",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "security": [
          {
            "Authorization": []
          }
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "User's short links",
            "schema": {
              "$ref": "#/definitions/Links"
            }
          }
        }
      }
    }
  },
  "definitions": {
    "User": {
      "properties": {
        "email": {
          "title": "User.email",
          "type": "string"
        },
        "password": {
          "title": "User.password",
          "type": "string"
        }
      },
      "required": [
        "email",
        "password"
      ],
      "additionalProperties": false,
      "title": "User",
      "type": "object"
    },
    "Token": {
      "properties": {
        "token": {
          "title": "Token.token",
          "type": "string"
        }
      },
      "required": [
        "token"
      ],
      "additionalProperties": false,
      "title": "Token",
      "type": "object"
    },
    "ErrorArr": {
      "properties": {
        "error": {
          "items": {
            "title": "ErrorArr.error.[]",
            "type": "string"
          },
          "title": "ErrorArr.error",
          "type": "array"
        }
      },
      "required": [
        "error"
      ],
      "additionalProperties": false,
      "title": "ErrorArr",
      "type": "object"
    },
    "ErrorStr": {
      "properties": {
        "error": {
          "title": "ErrorStr.error",
          "type": "string"
        }
      },
      "required": [
        "error"
      ],
      "additionalProperties": false,
      "title": "ErrorStr",
      "type": "object"
    },
    "CreateLink": {
      "properties": {
        "originalLink": {
          "title": "CreateLink.originalLink",
          "type": "string"
        },
        "ttl": {
          "enum": [
            "once",
            "1",
            "3",
            "7"
          ],
          "title": "CreateLink.ttl",
          "type": "string"
        }
      },
      "required": [
        "originalLink",
        "ttl"
      ],
      "additionalProperties": false,
      "title": "CreateLink",
      "type": "object"
    },
    "Link": {
      "properties": {
        "link": {
          "title": "Link.link",
          "type": "string"
        }
      },
      "required": [
        "link"
      ],
      "additionalProperties": false,
      "title": "Link",
      "type": "object"
    },
    "Links": {
      "properties": {
        "links": {
          "items": {
            "title": "Links.links.[]",
            "type": "string"
          },
          "title": "Links.links",
          "type": "array"
        }
      },
      "required": [
        "links"
      ],
      "additionalProperties": false,
      "title": "Links",
      "type": "object"
    }
  },
  "securityDefinitions": {
    "Authorization": {
      "type": "apiKey",
      "name": "Authorization",
      "in": "header"
    }
  },
  "basePath": "/dev"
};
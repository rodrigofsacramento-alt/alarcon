> ## Documentation Index
> Fetch the complete documentation index at: https://docs.evolutionfoundation.com.br/llms.txt
> Use this file to discover all available pages before exploring further.

# Send Text Message

> Send a text message



## OpenAPI

````yaml /api-reference/openapi/Evolution-API/message.yaml post /message/sendText/{instanceName}
openapi: 3.0.4
info:
  title: Evolution Foundation - Evolution API - Message
  description: Main Evolution API for WhatsApp
  version: 2.3.7
servers:
  - url: http://localhost:8080
    description: Local development server
  - url: https://api.evolution-api.com
    description: Production server
  - url: '{customUrl}'
    description: Custom server
    variables:
      customUrl:
        default: https://your-instance.com
        description: Enter your server URL
security:
  - ApiKeyAuth: []
paths:
  /message/sendText/{instanceName}:
    post:
      summary: Send Text Message
      description: Send a text message
      parameters:
        - $ref: '#/components/parameters/InstanceName'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SendText'
      responses:
        '200':
          description: Message sent
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
        '400':
          description: Bad Request (invalid data)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: BAD_REQUEST
                  message: Invalid input data
                meta:
                  timestamp: '2024-01-15T10:30:00Z'
                  path: /message/sendText/{instanceName}
                  method: POST
        '401':
          description: Unauthorized (invalid or missing token)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: UNAUTHORIZED
                  message: Invalid or missing authentication token
                meta:
                  timestamp: '2024-01-15T10:30:00Z'
                  path: /message/sendText/{instanceName}
                  method: POST
        '403':
          description: Forbidden (insufficient permissions)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: FORBIDDEN
                  message: Insufficient permissions to perform this action
                meta:
                  timestamp: '2024-01-15T10:30:00Z'
                  path: /message/sendText/{instanceName}
                  method: POST
        '404':
          description: Not Found (resource not found)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: NOT_FOUND
                  message: Instance not found
                meta:
                  timestamp: '2024-01-15T10:30:00Z'
                  path: /message/sendText/{instanceName}
                  method: POST
        '500':
          description: Internal Server Error (server error)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: INTERNAL_SERVER_ERROR
                  message: An unexpected error occurred
                meta:
                  timestamp: '2024-01-15T10:30:00Z'
                  path: /message/sendText/{instanceName}
                  method: POST
components:
  parameters:
    InstanceName:
      name: instanceName
      in: path
      required: true
      description: WhatsApp instance name
      schema:
        type: string
        example: my-instance
  schemas:
    SendText:
      type: object
      required:
        - number
        - textMessage
      properties:
        number:
          type: string
          description: Phone number with country code (e.g., 5511999999999)
        textMessage:
          type: object
          required:
            - text
          properties:
            text:
              type: string
        delay:
          type: integer
        quoted:
          type: object
        linkPreview:
          type: boolean
        mentioned:
          type: array
          items:
            type: string
    MessageResponse:
      type: object
      properties:
        key:
          type: object
        message:
          type: object
        status:
          type: string
    ErrorResponse:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
            message:
              type: string
        meta:
          type: object
          properties:
            timestamp:
              type: string
              format: date-time
            path:
              type: string
            method:
              type: string
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: apikey
      description: API Key for authentication (global or instance-specific)

````
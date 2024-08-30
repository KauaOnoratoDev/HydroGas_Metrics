# API de Medições

Este projeto fornece uma API para gerenciar medições de clientes. Ele oferece três endpoints principais para adicionar medições, confirmar medições e listar medições por código de cliente.

## Endpoints

### 1. Adicionar Medição

**Endpoint:** `POST /upload`

**Descrição:** Recebe uma imagem em base64, consulta a API Gemini e retorna a medida lida pela API.

**Requisitos:**

- **Validação de Dados:** Valida o tipo de dados dos parâmetros, incluindo base64.
- **Verificação de Leitura:** Verifica se já existe uma leitura no mês para o mesmo tipo de medição.
- **Integração com LLM:** Consulta uma API de LLM para extrair o valor da imagem.

**Request Body:**

```json
{
  "image": "base64",
  "customer_code": "string",
  "measure_datetime": "datetime",
  "measure_type": "WATER/GAS"
}
```

**Respostas:**

**200 OK:**
```json
{
  "image_url": "link_temporario_para_imagem",
  "measure_value": 123,
  "measure_uuid": "guid_da_medicao"
}
```

**400 Bad Request:**
```json
{
  "error_code": "INVALID_DATA",
  "error_description": "Descrição do erro"
}
```

**409 Conflict:**
```json
{
  "error_code": "DOUBLE_REPORT",
  "error_description": "Leitura do mês já realizada"
}
```


### 2. Confirmar Medição

**Endpoint:** `PATCH /confirm`

**Descrição:** Confirma ou corrige o valor lido pela LLM.

**Requisitos:**

- **Validação de Dados:** Valida o tipo de dados dos parâmetros enviados.
- **Verificação de Leitura:** Verifica se o código de leitura informado existe e se já foi confirmado.
- **Atualização no Banco de Dados:** Atualiza o banco de dados com o novo valor confirmado.

**Request Body:**

```json
{
  "measure_uuid": "string",
  "confirmed_value": "integer"
}
```

**Respostas:**

**200 OK:**
```json
{
  "success": true
}
```

**400 Bad Request:**
```json
{
  "error_code": "INVALID_DATA",
  "error_description": "Descrição do erro"
}
```

**404 Not Found:**
```json
{
  "error_code": "MEASURE_NOT_FOUND",
  "error_description": "Leitura não encontrada"
}
```

409 Conflict:**
```json
{
  "error_code": "CONFIRMATION_DUPLICATE",
  "error_description": "Leitura já confirmada"
}
```


### 3. Listar Medições por Código do Cliente

**Endpoint:** `GET /<customer_code>/list`

**Descrição:** Lista todas as medições realizadas por um cliente específico. Pode opcionalmente filtrar por tipo de medição.

**Parâmetros de Consulta (Query Parameters):**

- **measure_type** (opcional): Pode ser `"WATER"` ou `"GAS"`. A validação é case insensitive. Se não fornecido, todas as medições serão retornadas.

**Respostas:**

- **200 OK:**

  ```json
  {
    "customer_code": "string",
    "measures": [
      {
        "measure_uuid": "string",
        "measure_datetime": "datetime",
        "measure_type": "WATER/GAS",
        "has_confirmed": "boolean",
        "image_url": "string"
      },
      {
        "measure_uuid": "string",
        "measure_datetime": "datetime",
        "measure_type": "WATER/GAS",
        "has_confirmed": "boolean",
        "image_url": "string"
      }
    ]
  }
  ```

**400 Bad Request:**
```json
  {
     "error_code": "INVALID_TYPE",
     "error_description": "Tipo de medição não permitida"
  }

  ```

**404 Not Found:**
  ```json
  {
     "error_code": "MEASURES_NOT_FOUND",
     "error_description": "Nenhuma leitura encontrada"
  }
  ```

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str
    s3_bucket_name: str
    cloudflare_account_id: str
    cloudflare_api_token: str
    workers_ai_embedding_model: str = "@cf/baai/bge-m3"
    workers_ai_chat_model: str = "@cf/meta/llama-3.1-8b-instruct"
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

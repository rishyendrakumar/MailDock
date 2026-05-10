from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    smtp_bucket_base_url: str = "https://api.smtpbucket.com"
    smtp_bucket_html_base_url: str = "https://www.smtpbucket.com"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"]
    default_email_limit: int = 100

    class Config:
        env_file = ".env"


settings = Settings()
